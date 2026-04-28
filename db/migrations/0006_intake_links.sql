-- =============================================================================
-- 0006 — Public intake links for recruiters
-- =============================================================================
-- Modelo:
--   recruiter_intake_links   → un slug permanente por reclutador (job + candidate)
--   intake_submissions       → cada vez que alguien usa el link público
--                              (texto/audio/file) antes y después de parsing IA

-- ----- INTAKE LINKS -----------------------------------------------------------
create table if not exists recruiter_intake_links (
  id                uuid primary key default uuid_generate_v4(),
  recruiter_id      uuid not null references recruiters(id) on delete cascade,
  slug              text unique not null,                            -- ej "maria-perez"
  kind              text not null check (kind in ('job','candidate','both')) default 'both',
  is_active         boolean default true,
  -- copy mostrado en la página pública
  display_name      text,                                            -- "María Pérez · Reclutadora"
  display_company   text,                                            -- "TalentX"
  display_avatar    text,
  welcome_message   text,                                            -- override del default
  -- contadores
  submissions_count int default 0,
  jobs_published    int default 0,
  candidates_added  int default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
create index if not exists intake_links_recruiter_idx on recruiter_intake_links (recruiter_id);
create index if not exists intake_links_slug_idx      on recruiter_intake_links (slug) where is_active;

-- ----- INTAKE SUBMISSIONS -----------------------------------------------------
-- Cada visita que llega a un punto útil (al menos describió algo).
-- raw_inputs: array de { type: text|audio|image|pdf, content: string|url }
-- parsed_data: el JSON estructurado (job o candidate) que devolvió Claude
create table if not exists intake_submissions (
  id                uuid primary key default uuid_generate_v4(),
  intake_link_id    uuid not null references recruiter_intake_links(id) on delete cascade,
  recruiter_id      uuid not null references recruiters(id) on delete cascade,
  kind              text not null check (kind in ('job','candidate')),
  -- Datos crudos enviados por el usuario
  raw_inputs        jsonb default '[]'::jsonb,
  -- Resultado IA
  parsed_data       jsonb default '{}'::jsonb,
  ai_suggestions    jsonb default '[]'::jsonb,
  -- Confirmación
  confirmer_email   text,
  confirmer_name    text,
  confirmer_phone   text,
  email_verified    boolean default false,
  verification_code text,
  verification_sent_at timestamptz,
  verification_expires_at timestamptz,
  -- Estado del flujo
  status            text not null default 'draft'
    check (status in ('draft','awaiting_verification','verified','published','rejected','spam')),
  -- Vínculos a entidades creadas tras confirmación
  job_id            uuid references jobs(id) on delete set null,
  candidate_id      uuid references candidates(id) on delete set null,
  -- Anti-abuso
  ip_hash           text,
  user_agent        text,
  -- Timestamps
  submitted_at      timestamptz default now(),
  confirmed_at      timestamptz,
  published_at      timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
create index if not exists intake_subs_link_idx        on intake_submissions (intake_link_id, submitted_at desc);
create index if not exists intake_subs_recruiter_idx   on intake_submissions (recruiter_id, submitted_at desc);
create index if not exists intake_subs_status_idx      on intake_submissions (status);
create index if not exists intake_subs_email_idx       on intake_submissions (confirmer_email);
create index if not exists intake_subs_ip_idx          on intake_submissions (ip_hash, submitted_at desc);

-- updated_at triggers
do $$
declare t text;
begin
  for t in
    select unnest(array['recruiter_intake_links','intake_submissions'])
  loop
    execute format('drop trigger if exists trg_%I_upd on %I', t, t);
    execute format('create trigger trg_%I_upd before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- ----- RLS --------------------------------------------------------------------
-- Public can read active links by slug. Submissions: solo service_role.
alter table recruiter_intake_links enable row level security;
alter table intake_submissions     enable row level security;

drop policy if exists intake_links_public_read on recruiter_intake_links;
create policy intake_links_public_read on recruiter_intake_links
  for select using (is_active = true);

drop policy if exists intake_links_owner_all on recruiter_intake_links;
create policy intake_links_owner_all on recruiter_intake_links
  for all using (
    exists (
      select 1 from recruiters r
      where r.id = recruiter_intake_links.recruiter_id
        and r.user_id = auth.uid()
    )
  );

-- Submissions: el reclutador dueño puede ver las suyas. Service role hace todo.
drop policy if exists intake_subs_owner_read on intake_submissions;
create policy intake_subs_owner_read on intake_submissions
  for select using (
    exists (
      select 1 from recruiters r
      where r.id = intake_submissions.recruiter_id
        and r.user_id = auth.uid()
    )
  );

-- ----- Helpful: get_active_link_by_slug ---------------------------------------
create or replace function intake_link_by_slug(p_slug text)
returns table (
  id uuid,
  recruiter_id uuid,
  slug text,
  kind text,
  display_name text,
  display_company text,
  display_avatar text,
  welcome_message text
)
language sql stable as $$
  select id, recruiter_id, slug, kind,
         display_name, display_company, display_avatar, welcome_message
    from recruiter_intake_links
   where slug = p_slug and is_active = true
   limit 1;
$$;
