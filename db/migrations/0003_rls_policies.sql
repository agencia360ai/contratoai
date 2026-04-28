-- =============================================================================
-- 0003 — Row-Level Security (Ley 81 + Supabase Auth)
-- =============================================================================
-- Anon: ve jobs activos + companies + recruiters públicos + leaderboards.
-- Authenticated: ve sus propios candidate/applications/matches.
-- Service role: bypasses RLS (used by scrapers + matching pipeline).

alter table jobs           enable row level security;
alter table companies      enable row level security;
alter table candidates     enable row level security;
alter table recruiters     enable row level security;
alter table applications   enable row level security;
alter table matches        enable row level security;

-- ---- Public reads -----------------------------------------------------------
drop policy if exists "jobs_public_read" on jobs;
create policy "jobs_public_read" on jobs
  for select
  using (is_active);

drop policy if exists "companies_public_read" on companies;
create policy "companies_public_read" on companies
  for select using (true);

drop policy if exists "recruiters_public_read" on recruiters;
create policy "recruiters_public_read" on recruiters
  for select using (true);

-- ---- Candidate ownership ----------------------------------------------------
drop policy if exists "candidate_self_select" on candidates;
create policy "candidate_self_select" on candidates
  for select using (auth.uid() = user_id);

drop policy if exists "candidate_self_insert" on candidates;
create policy "candidate_self_insert" on candidates
  for insert with check (auth.uid() = user_id);

drop policy if exists "candidate_self_update" on candidates;
create policy "candidate_self_update" on candidates
  for update using (auth.uid() = user_id);

drop policy if exists "candidate_self_delete" on candidates;
create policy "candidate_self_delete" on candidates
  for delete using (auth.uid() = user_id);

-- ---- Applications: candidate y recruiter de la company tienen acceso ---------
drop policy if exists "application_candidate_all" on applications;
create policy "application_candidate_all" on applications
  for all
  using (auth.uid() = (select user_id from candidates where id = applications.candidate_id))
  with check (auth.uid() = (select user_id from candidates where id = applications.candidate_id));

drop policy if exists "application_recruiter_read" on applications;
create policy "application_recruiter_read" on applications
  for select
  using (
    auth.uid() in (
      select r.user_id from recruiters r
      where r.company_id = (select company_id from jobs where id = applications.job_id)
    )
  );

drop policy if exists "application_recruiter_update" on applications;
create policy "application_recruiter_update" on applications
  for update
  using (
    auth.uid() in (
      select r.user_id from recruiters r
      where r.company_id = (select company_id from jobs where id = applications.job_id)
    )
  );

-- ---- Matches: solo el candidato dueño los ve --------------------------------
drop policy if exists "match_candidate_select" on matches;
create policy "match_candidate_select" on matches
  for select
  using (auth.uid() = (select user_id from candidates where id = matches.candidate_id));

-- ---- Recruiter ownership ----------------------------------------------------
drop policy if exists "recruiter_self_update" on recruiters;
create policy "recruiter_self_update" on recruiters
  for update using (auth.uid() = user_id);

drop policy if exists "recruiter_self_insert" on recruiters;
create policy "recruiter_self_insert" on recruiters
  for insert with check (auth.uid() = user_id);
