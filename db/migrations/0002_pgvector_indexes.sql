-- =============================================================================
-- 0002 — Vector indexes (HNSW for fast semantic search)
-- =============================================================================
-- HNSW params:
--   m              = 16   (connections per node)
--   ef_construction = 64   (build-time accuracy)
-- Rule of thumb: HNSW outperforms IVFFlat for <10M vectors.

create index if not exists jobs_embedding_hnsw
  on jobs using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

create index if not exists candidates_embedding_hnsw
  on candidates using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

create index if not exists companies_embedding_hnsw
  on companies using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

create index if not exists skills_embedding_hnsw
  on skills_taxonomy using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Set ef_search at session level (higher = more accurate, slower)
-- Apps can override per query.
alter database postgres set hnsw.ef_search = 100;
