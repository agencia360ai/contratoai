-- =============================================================================
-- 0010 — Public company profiles (claimed/unclaimed)
-- =============================================================================
-- Each scraped company gets a public-facing profile at /empresa/<slug>.
-- Default state is "unclaimed" — a recruiter user can later claim it.
--
-- Slug derivation:
--   normalized_name (already lowercased, ascii) → kebab-case
--   collisions broken by appending -2, -3, ...

alter table companies
  add column if not exists slug             text,
  add column if not exists is_claimed       boolean not null default false,
  add column if not exists claimed_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists claimed_at       timestamptz;

-- Idempotent backfill of slug
update companies
set slug = lower(regexp_replace(regexp_replace(normalized_name, '[^a-z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'))
where slug is null;

-- Resolve duplicates: keep the oldest row's slug, suffix the rest.
with ranked as (
  select id, slug,
         row_number() over (partition by slug order by created_at, id) as rn
  from companies
)
update companies c
set slug = c.slug || '-' || r.rn
from ranked r
where c.id = r.id and r.rn > 1;

-- Enforce uniqueness + index for fast lookup
alter table companies
  alter column slug set not null;

create unique index if not exists companies_slug_uidx on companies (slug);

-- Mark companies that already have a recruiter linked as "claimed"
update companies c
set is_claimed = true,
    claimed_by_user_id = r.user_id,
    claimed_at = coalesce(c.claimed_at, r.created_at, now())
from recruiters r
where r.company_id = c.id
  and r.user_id is not null
  and not c.is_claimed;
