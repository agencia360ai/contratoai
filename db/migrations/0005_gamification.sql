-- =============================================================================
-- 0005 — Gamification (XP, levels, badges, leaderboards, brackets)
-- =============================================================================
-- Modelo:
--   xp_events       → cada acción que da puntos (append-only, audit trail)
--   user_progress   → cache de XP total + nivel + streak por usuario
--   achievements    → catálogo de badges
--   user_achievements → badges desbloqueados
--   company_scores  → cache de score + bracket por empresa
--   recruiter_quests → "misiones" diarias/semanales para reclutadores
--   leaderboard_snapshots → snapshots semanales para "ranking del mes"

-- ----- XP EVENTS (append-only) ------------------------------------------------
create table if not exists xp_events (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null,                     -- candidate.user_id o recruiter.user_id
  user_type    text not null check (user_type in ('candidate','recruiter','company')),
  event_type   text not null,                     -- "profile_completed","application_sent",...
  xp           int not null,                      -- puede ser negativo (penalty)
  metadata     jsonb default '{}'::jsonb,
  created_at   timestamptz default now()
);
create index if not exists xp_events_user_idx on xp_events (user_id, created_at desc);
create index if not exists xp_events_type_idx on xp_events (event_type);

-- ----- USER PROGRESS (cache) --------------------------------------------------
create table if not exists user_progress (
  user_id           uuid primary key,
  user_type         text not null check (user_type in ('candidate','recruiter','company')),
  total_xp          int default 0,
  level             int default 1,
  bracket           text default 'bronze' check (bracket in ('bronze','silver','gold','platinum','diamond','legend')),
  -- Streak
  current_streak    int default 0,
  longest_streak    int default 0,
  last_active_date  date,
  -- Stats
  applications_sent int default 0,
  matches_received  int default 0,
  matches_liked     int default 0,
  interviews        int default 0,
  offers            int default 0,
  -- Rankings
  rank_global       int,
  rank_in_bracket   int,
  updated_at        timestamptz default now()
);
create index if not exists user_progress_xp_idx     on user_progress (total_xp desc);
create index if not exists user_progress_bracket_idx on user_progress (bracket);

-- ----- ACHIEVEMENTS (catálogo) ------------------------------------------------
create table if not exists achievements (
  id           serial primary key,
  slug         text unique not null,
  name_es      text not null,
  name_en      text,
  description  text not null,
  icon         text,                              -- Lucide icon name
  tier         text check (tier in ('common','rare','epic','legendary')),
  xp_reward    int default 0,
  user_type    text not null check (user_type in ('candidate','recruiter','company','any')),
  trigger_rule jsonb not null,                    -- {type:"profile_completion",value:100}
  created_at   timestamptz default now()
);

-- ----- USER ACHIEVEMENTS (desbloqueados) --------------------------------------
create table if not exists user_achievements (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null,
  achievement_id  int references achievements(id) on delete cascade,
  unlocked_at     timestamptz default now(),
  unique (user_id, achievement_id)
);
create index if not exists user_achievements_user_idx on user_achievements (user_id, unlocked_at desc);

-- ----- COMPANY SCORES ---------------------------------------------------------
create table if not exists company_scores (
  company_id              uuid primary key references companies(id) on delete cascade,
  -- Componentes del score (todos 0-1000 normalizados)
  response_time_score     numeric default 0,     -- inversamente proporcional a horas promedio
  interview_ratio_score   numeric default 0,     -- aplicaciones → entrevistas
  offer_ratio_score       numeric default 0,     -- entrevistas → ofertas
  candidate_review_score  numeric default 0,     -- promedio reviews 1-5 escalado
  diversity_score         numeric default 0,     -- diversidad de contrataciones
  transparency_score      numeric default 0,     -- % vacantes con salario público
  feedback_score          numeric default 0,     -- % rejected con feedback
  -- Totales
  total_score             numeric default 0,
  bracket                 text check (bracket in ('bronze','silver','gold','platinum','diamond','legend')),
  rank_global             int,
  rank_in_industry        int,
  rank_in_size_bucket     int,
  -- Metadata
  active_jobs_count       int default 0,
  total_applications      int default 0,
  total_hires             int default 0,
  avg_response_time_h     numeric,
  -- Trend
  score_change_week       numeric default 0,    -- ↑ ↓ vs hace 7 días
  score_change_month      numeric default 0,
  computed_at             timestamptz default now()
);
create index if not exists company_scores_total_idx    on company_scores (total_score desc);
create index if not exists company_scores_bracket_idx  on company_scores (bracket);
create index if not exists company_scores_industry_idx on company_scores (rank_in_industry);

-- ----- RECRUITER QUESTS (misiones diarias/semanales) --------------------------
create table if not exists quests (
  id           serial primary key,
  slug         text unique not null,
  title_es     text not null,
  description  text,
  icon         text,
  user_type    text check (user_type in ('candidate','recruiter')),
  cadence      text check (cadence in ('daily','weekly','one_time')),
  goal_type    text not null,                    -- "applications_sent","responses","skills_validated"
  goal_value   int not null,
  xp_reward    int not null,
  active       boolean default true,
  created_at   timestamptz default now()
);

create table if not exists user_quests (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null,
  quest_id     int references quests(id) on delete cascade,
  progress     int default 0,
  completed    boolean default false,
  completed_at timestamptz,
  date         date default current_date,        -- para daily/weekly reset
  created_at   timestamptz default now(),
  unique (user_id, quest_id, date)
);
create index if not exists user_quests_user_idx on user_quests (user_id, date desc);

-- ----- LEADERBOARD SNAPSHOTS --------------------------------------------------
create table if not exists leaderboard_snapshots (
  id              uuid primary key default uuid_generate_v4(),
  category        text not null,                 -- "companies","recruiters","candidates"
  scope           text not null,                 -- "global","industry:tech","city:panama"
  period          text not null,                 -- "weekly","monthly"
  period_start    date not null,
  period_end      date not null,
  rank            int not null,
  entity_id       uuid not null,                 -- company/recruiter/candidate id
  entity_name     text,
  score           numeric not null,
  bracket         text,
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz default now()
);
create index if not exists leaderboard_period_idx on leaderboard_snapshots (category, scope, period_end desc, rank);

-- ----- HELPERS ----------------------------------------------------------------

-- Calcular nivel a partir de XP (curva exponencial suave)
create or replace function xp_to_level(xp int)
returns int language sql immutable as $$
  select greatest(1, floor(sqrt(xp::float / 100))::int + 1);
$$;

-- Calcular bracket a partir de score/XP
create or replace function score_to_bracket(s numeric)
returns text language sql immutable as $$
  select case
    when s >= 50000 then 'legend'
    when s >= 20000 then 'diamond'
    when s >=  8000 then 'platinum'
    when s >=  3000 then 'gold'
    when s >=  1000 then 'silver'
    else                 'bronze'
  end;
$$;

-- Award XP (función pública, llamada desde la app)
create or replace function award_xp(
  p_user_id   uuid,
  p_user_type text,
  p_event     text,
  p_xp        int,
  p_meta      jsonb default '{}'::jsonb
) returns void language plpgsql security definer as $$
begin
  insert into xp_events (user_id, user_type, event_type, xp, metadata)
  values (p_user_id, p_user_type, p_event, p_xp, p_meta);

  insert into user_progress (user_id, user_type, total_xp, level, bracket, last_active_date)
  values (p_user_id, p_user_type, p_xp, xp_to_level(p_xp), score_to_bracket(p_xp), current_date)
  on conflict (user_id) do update
    set total_xp         = user_progress.total_xp + excluded.total_xp,
        level            = xp_to_level(user_progress.total_xp + excluded.total_xp),
        bracket          = score_to_bracket(user_progress.total_xp + excluded.total_xp),
        last_active_date = current_date,
        updated_at       = now();
end;
$$;

grant execute on function award_xp(uuid, text, text, int, jsonb) to authenticated;
grant execute on function award_xp(uuid, text, text, int, jsonb) to service_role;

-- Compute streak on login
create or replace function update_streak(p_user_id uuid)
returns int language plpgsql as $$
declare
  v_last      date;
  v_current   int;
  v_longest   int;
  v_new       int;
begin
  select last_active_date, current_streak, longest_streak
    into v_last, v_current, v_longest
  from user_progress where user_id = p_user_id;

  if v_last is null then
    v_new := 1;
  elsif v_last = current_date then
    return v_current;     -- ya activo hoy, no cambia
  elsif v_last = current_date - 1 then
    v_new := v_current + 1;
  else
    v_new := 1;            -- streak roto
  end if;

  update user_progress
     set current_streak   = v_new,
         longest_streak   = greatest(coalesce(v_longest, 0), v_new),
         last_active_date = current_date,
         updated_at       = now()
   where user_id = p_user_id;

  return v_new;
end;
$$;

grant execute on function update_streak(uuid) to authenticated;
grant execute on function update_streak(uuid) to service_role;

-- View: Top 100 leaderboard (companies)
create or replace view leaderboard_companies_v as
select
  cs.company_id,
  c.name,
  c.logo_url,
  c.industry,
  c.size,
  c.location,
  cs.total_score,
  cs.bracket,
  cs.rank_global,
  cs.rank_in_industry,
  cs.score_change_week,
  cs.avg_response_time_h,
  cs.active_jobs_count,
  cs.total_hires
from company_scores cs
join companies c on c.id = cs.company_id
order by cs.total_score desc;

-- View: Top reclutadores
create or replace view leaderboard_recruiters_v as
select
  r.id as recruiter_id,
  r.display_name,
  r.avatar_url,
  r.title,
  r.score,
  r.bracket,
  r.rank,
  c.name as company_name,
  c.logo_url as company_logo,
  c.industry,
  r.avg_response_time_h,
  r.hires_completed,
  r.is_verified
from recruiters r
left join companies c on c.id = r.company_id
order by r.score desc;

-- View: Top candidatos (opt-in, solo si comparten públicamente)
create or replace view leaderboard_candidates_v as
select
  c.id as candidate_id,
  c.display_name,
  c.avatar_url,
  up.total_xp,
  up.level,
  up.bracket,
  up.rank_global,
  up.applications_sent,
  up.interviews,
  up.offers,
  up.current_streak,
  c.location
from candidates c
join user_progress up on up.user_id = c.user_id
where coalesce((c.consent_data->>'leaderboard_public')::boolean, false)
order by up.total_xp desc;
