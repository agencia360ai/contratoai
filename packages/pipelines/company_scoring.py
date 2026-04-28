"""Compute company score / bracket / rank from applications + reviews.

Score model (max 1000 each component, sum max ~7000):

  response_time_score    = clamp(  600 / (avg_h + 1)        , 0, 1000)
  interview_ratio_score  = (interviews / max(1,apps))      * 1000
  offer_ratio_score      = (offers     / max(1,interviews))* 1000
  candidate_review_score = (avg_rating - 1) / 4            * 1000   # 1-5 → 0-1000
  diversity_score        = unique_attributes / hires       * 1000   # rough proxy
  transparency_score     = jobs_with_salary / active_jobs  * 1000
  feedback_score         = rejected_with_feedback / max(1,rejected) * 1000

Weights are equal — adjust as the platform learns.
"""
from __future__ import annotations
from typing import Any
from supabase import Client
from packages.shared.db import get_supabase_admin
from packages.shared.logger import get_logger

logger = get_logger(__name__)


def _bracket(score: float) -> str:
    if score >= 50_000:
        return "legend"
    if score >= 20_000:
        return "diamond"
    if score >= 8_000:
        return "platinum"
    if score >= 3_000:
        return "gold"
    if score >= 1_000:
        return "silver"
    return "bronze"


def compute_company_score(company_id: str, sb: Client | None = None) -> dict[str, Any]:
    sb = sb or get_supabase_admin()

    apps = (
        sb.table("applications")
        .select("id,status,applied_at,responded_at,interview_at,hired_at,rejected_at,rejection_feedback,recruiter_rating,job_id")
        .execute()
        .data
        or []
    )
    company_jobs = (
        sb.table("jobs")
        .select("id,is_active,salary_min")
        .eq("company_id", company_id)
        .execute()
        .data
        or []
    )
    job_ids = {j["id"] for j in company_jobs}
    company_apps = [a for a in apps if a.get("job_id") in job_ids]

    n = len(company_apps)
    interviews = sum(1 for a in company_apps if a.get("interview_at"))
    offers = sum(1 for a in company_apps if a.get("status") == "offer" or a.get("hired_at"))
    rejected = sum(1 for a in company_apps if a.get("status") == "rejected")
    rejected_with_feedback = sum(
        1 for a in company_apps if a.get("rejection_feedback") and a.get("status") == "rejected"
    )

    # Avg response time in hours
    response_times = []
    for a in company_apps:
        if a.get("responded_at") and a.get("applied_at"):
            try:
                from datetime import datetime
                t0 = datetime.fromisoformat(a["applied_at"].replace("Z", "+00:00"))
                t1 = datetime.fromisoformat(a["responded_at"].replace("Z", "+00:00"))
                response_times.append((t1 - t0).total_seconds() / 3600)
            except Exception:
                continue
    avg_h = (sum(response_times) / len(response_times)) if response_times else 72

    # Reviews
    ratings = [a["recruiter_rating"] for a in company_apps if a.get("recruiter_rating")]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0

    active_jobs = sum(1 for j in company_jobs if j.get("is_active"))
    jobs_with_salary = sum(1 for j in company_jobs if j.get("salary_min"))

    # Components (each 0-1000)
    response_time_score = max(0, min(1000, 600 / (avg_h + 1) * 100))
    interview_ratio_score = (interviews / max(1, n)) * 1000
    offer_ratio_score = (offers / max(1, interviews)) * 1000
    candidate_review_score = ((avg_rating - 1) / 4) * 1000 if avg_rating else 0
    transparency_score = (jobs_with_salary / max(1, active_jobs)) * 1000
    feedback_score = (rejected_with_feedback / max(1, rejected)) * 1000 if rejected else 500
    diversity_score = 500  # placeholder until we have demographic data

    total = (
        response_time_score
        + interview_ratio_score
        + offer_ratio_score
        + candidate_review_score
        + transparency_score
        + feedback_score
        + diversity_score
    )

    bracket = _bracket(total)

    sb.table("company_scores").upsert(
        {
            "company_id": company_id,
            "response_time_score": round(response_time_score, 2),
            "interview_ratio_score": round(interview_ratio_score, 2),
            "offer_ratio_score": round(offer_ratio_score, 2),
            "candidate_review_score": round(candidate_review_score, 2),
            "transparency_score": round(transparency_score, 2),
            "feedback_score": round(feedback_score, 2),
            "diversity_score": round(diversity_score, 2),
            "total_score": round(total, 2),
            "bracket": bracket,
            "active_jobs_count": active_jobs,
            "total_applications": n,
            "total_hires": offers,
            "avg_response_time_h": round(avg_h, 2),
        },
        on_conflict="company_id",
    ).execute()

    # Cache on companies row
    sb.table("companies").update(
        {"score": round(total, 2), "bracket": bracket}
    ).eq("id", company_id).execute()

    return {"company_id": company_id, "total": round(total, 2), "bracket": bracket}


def compute_all_company_scores(sb: Client | None = None) -> int:
    sb = sb or get_supabase_admin()
    companies = sb.table("companies").select("id").execute().data or []
    n = 0
    for c in companies:
        try:
            compute_company_score(c["id"], sb)
            n += 1
        except Exception as e:
            logger.warning("score_company_fail", company=c["id"], error=str(e))

    # Compute global ranks
    rows = (
        sb.table("company_scores")
        .select("company_id,total_score")
        .order("total_score", desc=True)
        .execute()
        .data
        or []
    )
    for rank, r in enumerate(rows, start=1):
        sb.table("company_scores").update({"rank_global": rank}).eq(
            "company_id", r["company_id"]
        ).execute()
        sb.table("companies").update({"rank_in_country": rank}).eq("id", r["company_id"]).execute()

    return n
