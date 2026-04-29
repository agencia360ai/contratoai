-- =============================================================================
-- 0008 — Job expiration defaults + auto-deactivation helper
-- =============================================================================
-- Default expires_at = scrape_time + 30 days. The cron calls
-- deactivate_stale_jobs() to flip is_active=false for expired rows.

alter table jobs alter column expires_at set default now() + interval '30 days';

update jobs
set expires_at = scraped_at + interval '30 days'
where expires_at is null;

create or replace function deactivate_stale_jobs()
returns int language plpgsql as $$
declare
  cnt int;
begin
  update jobs
  set is_active = false, updated_at = now()
  where is_active
    and expires_at is not null
    and expires_at < now();
  get diagnostics cnt = row_count;
  return cnt;
end;
$$;

grant execute on function deactivate_stale_jobs() to service_role;
