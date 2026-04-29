-- =============================================================================
-- 0009 — Repair auth.users rows with NULL token columns
-- =============================================================================
-- GoTrue's user lookup scans token columns into Go strings, which fail with
-- `converting NULL to string is unsupported` when the columns are NULL. The
-- side effect is `Database error querying schema` on /token (login). Users
-- inserted manually (or via tools that bypass `auth.signUp`) can land with
-- these columns NULL. Backfill them to empty strings so login works.

update auth.users
set
  confirmation_token         = coalesce(confirmation_token, ''),
  email_change               = coalesce(email_change, ''),
  email_change_token_new     = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  recovery_token             = coalesce(recovery_token, ''),
  phone_change               = coalesce(phone_change, ''),
  phone_change_token         = coalesce(phone_change_token, ''),
  reauthentication_token     = coalesce(reauthentication_token, '')
where
  confirmation_token is null
  or email_change is null
  or email_change_token_new is null
  or email_change_token_current is null
  or recovery_token is null
  or phone_change is null
  or phone_change_token is null
  or reauthentication_token is null;
