"""FastAPI service for heavy NLP that doesn't fit in Edge Functions.

Endpoints:
  POST /enrich/{job_id}      run skills/level/benefits/salary on a job
  POST /embed/job/{job_id}   embed a single job
  POST /embed/candidate/{id} embed a single candidate
  POST /match/{candidate_id} run full pipeline for one candidate
  GET  /health
"""
from __future__ import annotations
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from packages.ai.claude_client import enrich_job
from packages.ai.embeddings import embed_candidate, embed_job
from packages.pipelines.matching_pipeline import full_matching_for_candidate

app = FastAPI(title="TeContrato Panamá API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for prod
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/enrich/{job_id}")
async def post_enrich(job_id: str) -> dict:
    try:
        return await enrich_job(job_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/embed/job/{job_id}")
def post_embed_job(job_id: str) -> dict:
    return {"ok": embed_job(job_id), "job_id": job_id}


@app.post("/embed/candidate/{candidate_id}")
def post_embed_candidate(candidate_id: str) -> dict:
    return {"ok": embed_candidate(candidate_id), "candidate_id": candidate_id}


@app.post("/match/{candidate_id}")
async def post_match(candidate_id: str) -> dict:
    try:
        return await full_matching_for_candidate(candidate_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
