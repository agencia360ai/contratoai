"""Three-stage matching pipeline.

Stage 1 — pgvector multidimensional score (sub-50ms, $0)
Stage 2 — Claude Sonnet 4.5 re-rank with explanations (~3s, ~$0.08/candidate)
Stage 3 — Persist matches with breakdown + explanation
"""
from __future__ import annotations
import asyncio
import json
from typing import Any
import anthropic
from supabase import Client
from packages.ai.embeddings import embed_text
from packages.ai.prompts.system_prompts import SYSTEM_RERANK, USER_RERANK_TEMPLATE
from packages.shared.config import settings
from packages.shared.db import get_supabase_admin
from packages.shared.logger import get_logger

logger = get_logger(__name__)


def _ant() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


# ---- Stage 1 ---------------------------------------------------------------

def get_candidate_matches(
    candidate_id: str,
    top: int = 50,
    min_score: float = 0.30,
    sb: Client | None = None,
) -> list[dict[str, Any]]:
    sb = sb or get_supabase_admin()
    resp = sb.rpc(
        "match_jobs_for_candidate",
        {"p_candidate": candidate_id, "p_limit": top, "p_min_score": min_score},
    ).execute()
    return resp.data or []


# ---- Stage 2 ---------------------------------------------------------------

async def rerank_with_claude(
    candidate_id: str,
    pool: list[dict[str, Any]],
    sb: Client | None = None,
) -> list[dict[str, Any]]:
    sb = sb or get_supabase_admin()
    if not pool:
        return []

    cand = (
        sb.table("candidates")
        .select(
            "display_name,location,skills,profile_data,preferences,personality_scores,riasec_scores"
        )
        .eq("id", candidate_id)
        .single()
        .execute()
        .data
    )

    job_ids = [m["job_id"] for m in pool[:50]]
    jobs = (
        sb.table("jobs")
        .select(
            "id,title,location,salary_min,salary_max,salary_currency,modality,"
            "experience_level,skills_extracted,benefits_extracted,description,"
            "company_id"
        )
        .in_("id", job_ids)
        .execute()
        .data
        or []
    )

    payload_jobs = [
        {
            "job_id": j["id"],
            "title": j.get("title"),
            "location": j.get("location"),
            "modality": j.get("modality"),
            "level": j.get("experience_level"),
            "salary": [j.get("salary_min"), j.get("salary_max")],
            "currency": j.get("salary_currency"),
            "skills": (j.get("skills_extracted") or [])[:15],
            "benefits": (j.get("benefits_extracted") or [])[:8],
            "summary": (j.get("description") or "")[:600],
        }
        for j in jobs
    ]

    user_msg = USER_RERANK_TEMPLATE.format(
        candidate_json=json.dumps(cand, ensure_ascii=False)[:4000],
        n=len(payload_jobs),
        jobs_json=json.dumps(payload_jobs, ensure_ascii=False)[:30000],
    )

    msg = await asyncio.to_thread(
        _ant().messages.create,
        model=settings.claude_model_heavy,
        max_tokens=4000,
        temperature=0.2,
        system=[
            {"type": "text", "text": SYSTEM_RERANK, "cache_control": {"type": "ephemeral"}}
        ],
        messages=[{"role": "user", "content": user_msg}],
    )

    raw = msg.content[0].text
    try:
        s = raw.find("{")
        e = raw.rfind("}")
        parsed = json.loads(raw[s : e + 1])
        return parsed.get("ranked", []) or []
    except Exception as e:
        logger.warning("rerank_parse_fail", error=str(e))
        return []


# ---- Stage 3 ---------------------------------------------------------------

def store_matches(
    candidate_id: str,
    ranked: list[dict[str, Any]],
    pool: list[dict[str, Any]],
    sb: Client | None = None,
) -> int:
    sb = sb or get_supabase_admin()
    score_lookup = {m["job_id"]: m for m in pool}
    rows = []
    for r in ranked:
        jid = r.get("job_id")
        if not jid:
            continue
        base = score_lookup.get(jid, {})
        rows.append(
            {
                "candidate_id": candidate_id,
                "job_id": jid,
                "score": float(r.get("final_score") or base.get("score") or 0),
                "scores": {
                    "skill": float(base.get("skill_score") or 0),
                    "experience": float(base.get("exp_score") or 0),
                    "culture": float(base.get("culture_score") or 0),
                    "location": float(base.get("loc_score") or 0),
                    "salary": float(base.get("sal_score") or 0),
                    "ai_final": float(r.get("final_score") or 0),
                },
                "explanation": r.get("why"),
                "red_flags": r.get("red_flags") or [],
                "reranked_by_ai": True,
            }
        )
    if not rows:
        return 0
    try:
        sb.table("matches").upsert(rows, on_conflict="candidate_id,job_id").execute()
        return len(rows)
    except Exception as e:
        logger.exception("store_matches_fail", error=str(e))
        return 0


# ---- Public entry point ----------------------------------------------------

async def full_matching_for_candidate(
    candidate_id: str, sb: Client | None = None
) -> dict[str, Any]:
    sb = sb or get_supabase_admin()
    pool = get_candidate_matches(candidate_id, top=50, min_score=0.30, sb=sb)
    if not pool:
        return {"candidate_id": candidate_id, "stored": 0, "reason": "no_pool"}

    ranked = await rerank_with_claude(candidate_id, pool, sb=sb)
    if not ranked:
        # If reranker failed, store the pgvector pool as fallback
        ranked = [{"job_id": m["job_id"], "final_score": m["score"], "why": None} for m in pool]

    stored = store_matches(candidate_id, ranked, pool, sb=sb)
    return {"candidate_id": candidate_id, "stored": stored, "ranked_count": len(ranked)}


async def full_matching_all_candidates(sb: Client | None = None) -> dict[str, Any]:
    sb = sb or get_supabase_admin()
    candidates = (
        sb.table("candidates")
        .select("id")
        .eq("onboarding_complete", True)
        .not_.is_("embedding", "null")
        .execute()
        .data
        or []
    )
    results = []
    for c in candidates:
        try:
            r = await full_matching_for_candidate(c["id"], sb)
            results.append(r)
        except Exception as e:
            logger.exception("match_fail", candidate=c["id"], error=str(e))
    return {"processed": len(results), "results": results}
