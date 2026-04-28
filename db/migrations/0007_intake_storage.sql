-- =============================================================================
-- 0007 — Storage bucket for intake uploads (audio, images, PDFs, CVs)
-- =============================================================================
-- Bucket "intake-uploads" privado. Las API routes firman URLs por cada read.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'intake-uploads',
  'intake-uploads',
  false,
  52428800, -- 50 MB
  array[
    'image/png','image/jpeg','image/webp','image/heic',
    'audio/mpeg','audio/mp4','audio/webm','audio/ogg','audio/wav','audio/x-m4a',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Policies: only service_role can read/write. (Las API routes usan service key.)
-- No policies = denied to anon. Default storage.objects rls already on.
