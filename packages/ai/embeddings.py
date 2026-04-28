"""OpenAI embeddings + helpers to embed jobs / candidates / companies."""
from __future__ import annotations
import asyncio
from functools import lru_cache
from typing import Any
import openai
from supabase import Client
from packages.shared.config import settings
from packages.shared.db import get_supabase_admin
from packages.shared.logger import get_logger

logger = get_logger(__name__)


@lru_cache(maxsize=1)
def get_openai() -> openai.OpenAI:
    return openai.OpenAI(api_key=settings.openai_api_key)


def embed_text(text: str) -> list[float]:
    text = (text or "").strip()
    if not text:
        return [0.0] * settings.embedding_dimensions
    text = text[:8000]  # ~ token cap for safety
    r = get_openai().embeddings.create(
        model=settings.embedding_model,
        input=text,
        dimensions=settings.embedding_dimensions,
    )
    return r.data[0].embedding


async def embed_text_async(text: str) -> list[float]:
    return await asyncio.to_thread(embed_text, text)


def _job_text(j: dict[str, Any]) -> str:
    parts = [
        j.get("title") or "",
        j.get("location") or "",
        j.get("industry") or "",
        " ".join(j.get("skills_extracted") or []),
        " ".join(j.get("benefits_extracted") or []),
        (j.get("description") or "")[:3500],
    ]
    return "\n".join(p for p in parts if p)


def _candidate_text(c: dict[str, Any]) -> str:
    skills = c.get("skills") or []
    skill_names = [s.get("name") if isinstance(s, dict) else str(s) for s in skills]
    experiences = c.get("experiences") or []
    exp_text = " | ".join(
        f"{e.get('title','')} en {e.get('company','')}"
        for e in experiences
        if isinstance(e, dict)
    )
    pers = c.get("personality_scores") or {}
    pers_text = " ".join(f"{k}={v}" for k, v in pers.items() if isinstance(v, (int, float)))
    riasec = c.get("riasec_scores") or {}
    riasec_text = f"RIASEC code={riasec.get('code','')}" if riasec else ""
    parts = [
        c.get("display_name") or "",
        c.get("location") or "",
        " ".join(skill_names),
        exp_text,
        pers_text,
        riasec_text,
        (c.get("cv_text") or "")[:2500],
    ]
    return "\n".join(p for p in parts if p)


def embed_job(job_id: str, sb: Client | None = None) -> bool:
    sb = sb or get_supabase_admin()
    j = sb.table("jobs").select("*").eq("id", job_id).single().execute().data
    if not j:
        return False
    vec = embed_text(_job_text(j))
    sb.table("jobs").update({"embedding": vec}).eq("id", job_id).execute()
    return True


def embed_candidate(candidate_id: str, sb: Client | None = None) -> bool:
    sb = sb or get_supabase_admin()
    c = sb.table("candidates").select("*").eq("id", candidate_id).single().execute().data
    if not c:
        return False
    vec = embed_text(_candidate_text(c))
    sb.table("candidates").update({"embedding": vec}).eq("id", candidate_id).execute()
    return True


def embed_jobs_batch(job_ids: list[str], sb: Client | None = None) -> int:
    sb = sb or get_supabase_admin()
    ok = 0
    for jid in job_ids:
        try:
            if embed_job(jid, sb):
                ok += 1
        except Exception as e:
            logger.warning("embed_job_fail", job_id=jid, error=str(e))
    return ok
