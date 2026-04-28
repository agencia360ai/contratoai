-- =============================================================================
-- 0001 — Init schema (jobs, companies, candidates, applications, matches)
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "vector";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";
create extension if not exists "btree_gin";

-- ----- CITIES (geo de Panamá) -------------------------------------------------
create table if not exists cities (
  id          serial primary key,
  name        text not null,
  province    text not null,
  lat         double precision,
  lng         double precision,
  population  int,
  slug        text unique,
  created_at  timestamptz default now()
);
create index if not exists cities_name_trgm_idx on cities using gin (name gin_trgm_ops);
create index if not exists cities_province_idx  on cities (province);

-- ----- COMPANIES --------------------------------------------------------------
create table if not exists companies (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  normalized_name   text unique not null,
  industry          text,
  size              text check (size in ('1-10','11-50','51-200','201-500','500+','unknown') or size is null),
  location          text,
  city_id           int references cities(id),
  website           text,
  description       text,
  logo_url          text,
  embedding         vector(1536),
  -- gamification (denormalized cache; source of truth en company_scores)
  score             numeric default 0,
  bracket           text check (bracket in ('bronze','silver','gold','platinum','diamond','legend') or bracket is null),
  rank_in_country   int,
  rank_in_industry  int,
  metadata          jsonb default '{}'::jsonb,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
create index if not exists companies_name_trgm_idx on companies using gin (name gin_trgm_ops);
create index if not exists companies_industry_idx  on companies (industry);
create index if not exists companies_score_idx     on companies (score desc);
create index if not exists companies_bracket_idx   on companies (bracket);

-- ----- JOBS (tabla central) ---------------------------------------------------
create table if not exists jobs (
  id                       uuid primary key default uuid_generate_v4(),
  source                   text not null,
  source_id                text not null,
  url                      text not null,
  fingerprint              text unique not null,
  title                    text not null,
  company_id               uuid references companies(id) on delete set null,
  location                 text,
  city_id                  int references cities(id),
  lat                      double precision,
  lng                      double precision,
  salary_min               numeric,
  salary_max               numeric,
  salary_currency          text default 'PAB',
  salary_period            text default 'monthly',
  description              text,
  requirements_raw         text,
  requirements_extracted   jsonb default '[]'::jsonb,
  skills_extracted         jsonb default '[]'::jsonb,
  benefits_extracted       jsonb default '[]'::jsonb,
  languages_required       jsonb default '[]'::jsonb,
  experience_level         text check (experience_level in ('intern','junior','mid','senior','lead','exec') or experience_level is null),
  experience_years_min     numeric,
  experience_years_max     numeric,
  contract_type            text,
  modality                 text check (modality in ('onsite','remote','hybrid') or modality is null),
  industry                 text,
  posted_at                timestamptz,
  scraped_at               timestamptz default now(),
  expires_at               timestamptz,
  raw_html                 text,
  embedding                vector(1536),
  is_active                boolean default true,
  views_count              int default 0,
  applications_count       int default 0,
  extra                    jsonb default '{}'::jsonb,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now(),
  unique (source, source_id)
);

create index if not exists jobs_active_scraped_idx on jobs (is_active, scraped_at desc);
create index if not exists jobs_company_idx        on jobs (company_id);
create index if not exists jobs_skills_gin_idx     on jobs using gin (skills_extracted jsonb_path_ops);
create index if not exists jobs_industry_idx       on jobs (industry);
create index if not exists jobs_experience_idx     on jobs (experience_level);
create index if not exists jobs_modality_idx       on jobs (modality);
create index if not exists jobs_fts_idx
  on jobs using gin (to_tsvector('spanish', coalesce(title,'') || ' ' || coalesce(description,'')));

-- ----- CANDIDATES (PII hasheada) ----------------------------------------------
create table if not exists candidates (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid unique,                       -- FK a auth.users (Supabase)
  full_name_hash      text,
  email_hash          text,
  display_name        text,
  avatar_url          text,
  location            text,
  city_id             int references cities(id),
  -- Perfil estructurado (Big Five + RIASEC + skills + preferencias)
  profile_data        jsonb default '{}'::jsonb,
  cv_text             text,
  cv_url              text,
  skills              jsonb default '[]'::jsonb,
  experiences         jsonb default '[]'::jsonb,
  education           jsonb default '[]'::jsonb,
  languages           jsonb default '[]'::jsonb,
  certifications      jsonb default '[]'::jsonb,
  personality_scores  jsonb default '{}'::jsonb,         -- BFI-2-S facets
  riasec_scores       jsonb default '{}'::jsonb,         -- {R,I,A,S,E,C, code:"SEI"}
  preferences         jsonb default '{}'::jsonb,         -- salary_min, modality, industries
  embedding           vector(1536),
  -- Onboarding state
  onboarding_step     int default 0,
  onboarding_complete boolean default false,
  profile_completion  int default 0,                     -- 0-100
  -- Consent (Ley 81 PA)
  consent_data        jsonb default '{}'::jsonb,
  consent_at          timestamptz,
  -- Activity
  last_active_at      timestamptz default now(),
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
create index if not exists candidates_user_idx        on candidates (user_id);
create index if not exists candidates_active_idx      on candidates (last_active_at desc);
create index if not exists candidates_complete_idx    on candidates (onboarding_complete);

-- ----- RECRUITERS (humanos detrás de empresas) --------------------------------
create table if not exists recruiters (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid unique,
  company_id      uuid references companies(id) on delete set null,
  display_name    text,
  avatar_url      text,
  title           text,                                  -- "Talent Acquisition Mgr"
  email_hash      text,
  phone_hash      text,
  -- Métricas que alimentan score
  responses_count       int default 0,
  avg_response_time_h   numeric,
  interviews_held       int default 0,
  offers_made           int default 0,
  hires_completed       int default 0,
  candidates_rejected_with_feedback int default 0,
  -- Score gamificado
  score           numeric default 0,
  bracket         text check (bracket in ('bronze','silver','gold','platinum','diamond','legend') or bracket is null),
  rank            int,
  is_verified     boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists recruiters_company_idx on recruiters (company_id);
create index if not exists recruiters_score_idx   on recruiters (score desc);

-- ----- APPLICATIONS -----------------------------------------------------------
create table if not exists applications (
  id              uuid primary key default uuid_generate_v4(),
  candidate_id    uuid references candidates(id) on delete cascade,
  job_id          uuid references jobs(id) on delete cascade,
  recruiter_id    uuid references recruiters(id) on delete set null,
  status          text default 'sent' check (status in ('saved','sent','viewed','interview','offer','rejected','withdrawn','hired')),
  match_score     numeric,
  cover_letter    text,
  notes           text,
  -- Tracking de gamificación
  applied_at          timestamptz default now(),
  viewed_at           timestamptz,
  responded_at        timestamptz,
  interview_at        timestamptz,
  rejected_at         timestamptz,
  rejection_feedback  text,
  hired_at            timestamptz,
  -- Candidate's review of the recruiter (post-process)
  recruiter_rating    int check (recruiter_rating between 1 and 5 or recruiter_rating is null),
  recruiter_review    text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique (candidate_id, job_id)
);
create index if not exists applications_candidate_idx on applications (candidate_id, applied_at desc);
create index if not exists applications_job_idx       on applications (job_id);
create index if not exists applications_status_idx    on applications (status);
create index if not exists applications_recruiter_idx on applications (recruiter_id);

-- ----- MATCHES (precomputados) ------------------------------------------------
create table if not exists matches (
  id            uuid primary key default uuid_generate_v4(),
  candidate_id  uuid references candidates(id) on delete cascade,
  job_id        uuid references jobs(id) on delete cascade,
  score         numeric not null,
  scores        jsonb not null,                          -- breakdown por dimensión
  explanation   text,                                     -- "Tu experiencia en X..."
  red_flags     jsonb default '[]'::jsonb,
  reranked_by_ai boolean default false,
  is_seen       boolean default false,
  is_liked      boolean default false,
  created_at    timestamptz default now(),
  unique (candidate_id, job_id)
);
create index if not exists matches_candidate_score_idx on matches (candidate_id, score desc);
create index if not exists matches_job_score_idx       on matches (job_id, score desc);

-- ----- SKILLS TAXONOMY (O*NET / ESCO based) -----------------------------------
create table if not exists skills_taxonomy (
  id          serial primary key,
  slug        text unique not null,
  name_en     text not null,
  name_es     text,
  category    text,                                       -- "tech","soft","language","tool"
  onet_id     text,
  esco_uri    text,
  embedding   vector(1536),
  aliases     text[] default '{}',
  created_at  timestamptz default now()
);
create index if not exists skills_name_trgm_idx on skills_taxonomy using gin (name_en gin_trgm_ops);
create index if not exists skills_category_idx  on skills_taxonomy (category);

-- ----- AUDIT (raw scrapes) ----------------------------------------------------
create table if not exists raw_scrapes (
  id            uuid primary key default uuid_generate_v4(),
  source        text not null,
  url           text not null,
  status_code   int,
  bytes         int,
  duration_ms   int,
  ok            boolean,
  error         text,
  scraped_at    timestamptz default now()
);
create index if not exists raw_scrapes_source_date_idx on raw_scrapes (source, scraped_at desc);

-- ----- NLP CACHE (Claude responses) -------------------------------------------
create table if not exists nlp_cache (
  key            text primary key,
  model          text,
  input_tokens   int,
  output_tokens  int,
  output         text,
  created_at     timestamptz default now()
);
create index if not exists nlp_cache_created_idx on nlp_cache (created_at desc);

-- ----- updated_at triggers ----------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  for t in
    select unnest(array['companies','jobs','candidates','recruiters','applications'])
  loop
    execute format('drop trigger if exists trg_%I_upd on %I', t, t);
    execute format('create trigger trg_%I_upd before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- ----- views útiles -----------------------------------------------------------
create or replace view jobs_active_v as
select j.*, c.name as company_name, c.bracket as company_bracket, c.score as company_score
  from jobs j
  left join companies c on c.id = j.company_id
 where j.is_active;
