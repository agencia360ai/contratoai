-- =============================================================================
-- 0004 — Matching function (multidimensional score, runs in pgvector)
-- =============================================================================

create or replace function match_jobs_for_candidate(
  p_candidate uuid,
  p_limit     int default 50,
  p_min_score numeric default 0.30
) returns table (
  job_id        uuid,
  score         numeric,
  skill_score   numeric,
  exp_score     numeric,
  culture_score numeric,
  loc_score     numeric,
  sal_score     numeric
) language plpgsql stable as $$
declare
  v_emb       vector(1536);
  v_skills    jsonb;
  v_loc       text;
  v_pref      jsonb;
  v_min_sal   numeric;
  v_exp_years numeric;
begin
  select c.embedding,
         c.skills,
         c.location,
         c.preferences,
         (c.preferences->>'salary_min')::numeric,
         (c.profile_data->>'total_years_experience')::numeric
    into v_emb, v_skills, v_loc, v_pref, v_min_sal, v_exp_years
  from candidates c
  where c.id = p_candidate;

  if v_emb is null then
    raise exception 'Candidate % has no embedding', p_candidate;
  end if;

  return query
  with cand_skills as (
    select lower(jsonb_array_elements_text(coalesce(v_skills, '[]'::jsonb))) as s
  ),
  scored as (
    select j.id as job_id,
      -- skill_score = % of job skills the candidate has
      coalesce((
        select count(*) filter (where lower(skill) in (select s from cand_skills))::numeric
             / nullif(jsonb_array_length(j.skills_extracted), 0)
        from jsonb_array_elements_text(j.skills_extracted) skill
      ), 0) as skill_score,

      -- exp_score: based on candidate's years vs job's required range
      case
        when j.experience_level is null then 0.6
        when v_exp_years is null then 0.5
        when v_exp_years between coalesce(j.experience_years_min, 0) and coalesce(j.experience_years_max, 99)
          then 1.0
        when v_exp_years < coalesce(j.experience_years_min, 0)
          then greatest(0.2, 1.0 - (j.experience_years_min - v_exp_years) * 0.2)
        else 0.7   -- candidate is overqualified, still potentially fine
      end as exp_score,

      -- culture_score: cosine similarity
      1 - (j.embedding <=> v_emb) as culture_score,

      -- loc_score: remote always great; otherwise check overlap
      case
        when j.modality = 'remote' then 1.0
        when v_loc is null then 0.5
        when j.location ilike '%' || split_part(v_loc, ',', 1) || '%' then 1.0
        when j.modality = 'hybrid' then 0.7
        else 0.3
      end as loc_score,

      -- sal_score: meet minimum expectation?
      case
        when j.salary_min is null or v_min_sal is null then 0.5
        when j.salary_min >= v_min_sal then 1.0
        when coalesce(j.salary_max, j.salary_min) >= v_min_sal then 0.7
        when j.salary_min >= v_min_sal * 0.85 then 0.5
        else 0.2
      end as sal_score
    from jobs j
    where j.is_active and j.embedding is not null
  )
  select
    s.job_id,
    round((
      0.40 * s.skill_score +
      0.20 * s.exp_score   +
      0.20 * s.culture_score +
      0.10 * s.loc_score   +
      0.10 * s.sal_score
    )::numeric, 4) as score,
    s.skill_score,
    s.exp_score,
    s.culture_score,
    s.loc_score,
    s.sal_score
  from scored s
  where (
    0.40 * s.skill_score +
    0.20 * s.exp_score   +
    0.20 * s.culture_score +
    0.10 * s.loc_score   +
    0.10 * s.sal_score
  ) >= p_min_score
  order by score desc
  limit p_limit;
end;
$$;

grant execute on function match_jobs_for_candidate(uuid, int, numeric) to authenticated;
grant execute on function match_jobs_for_candidate(uuid, int, numeric) to service_role;

-- Inverse: best candidates for a given job (used by recruiters)
create or replace function match_candidates_for_job(
  p_job       uuid,
  p_limit     int default 50,
  p_min_score numeric default 0.30
) returns table (
  candidate_id  uuid,
  score         numeric
) language plpgsql stable as $$
declare
  v_emb vector(1536);
begin
  select embedding into v_emb from jobs where id = p_job;
  if v_emb is null then return; end if;

  return query
  select c.id as candidate_id,
         round((1 - (c.embedding <=> v_emb))::numeric, 4) as score
    from candidates c
   where c.embedding is not null
     and c.onboarding_complete
     and (1 - (c.embedding <=> v_emb)) >= p_min_score
   order by c.embedding <=> v_emb
   limit p_limit;
end;
$$;

grant execute on function match_candidates_for_job(uuid, int, numeric) to authenticated;
grant execute on function match_candidates_for_job(uuid, int, numeric) to service_role;
