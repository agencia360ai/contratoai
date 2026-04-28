"""Prefect 3 flows that orchestrate the daily/weekly pipeline.

Run on demand:
    uv run python -m packages.pipelines.flows --flow daily_scrape
    uv run python -m packages.pipelines.flows --flow enrich_jobs
    uv run python -m packages.pipelines.flows --flow embed_jobs
    uv run python -m packages.pipelines.flows --flow match_all
    uv run python -m packages.pipelines.flows --flow score_companies
    uv run python -m packages.pipelines.flows --flow weekly_full
"""
from __future__ import annotations
import argparse
import asyncio
from prefect import flow, task
from packages.ai.claude_client import enrich_job
from packages.ai.embeddings import embed_job, embed_jobs_batch
from packages.pipelines.company_scoring import compute_all_company_scores
from packages.pipelines.matching_pipeline import full_matching_all_candidates
from packages.scrapers.acp import ACPScraper
from packages.scrapers.computrabajo import ComputrabajoPanamaScraper
from packages.scrapers.encuentra24 import Encuentra24Scraper
from packages.scrapers.hiring_room import HiringRoomScraper
from packages.scrapers.konzerta import KonzertaScraper
from packages.scrapers.mitradel import MitradelScraper
from packages.scrapers.workday import WorkdayScraper
from packages.scrapers.ciudad_del_saber import CiudadDelSaberScraper
from packages.shared.db import get_supabase_admin
from packages.shared.logger import get_logger

logger = get_logger(__name__)


# ---- Tasks ----------------------------------------------------------------

@task(retries=2, retry_delay_seconds=60)
async def task_scrape_computrabajo() -> dict:
    return await ComputrabajoPanamaScraper().run()


@task(retries=2, retry_delay_seconds=60)
async def task_scrape_encuentra24() -> dict:
    return await Encuentra24Scraper().run()


@task(retries=1, retry_delay_seconds=60)
async def task_scrape_konzerta() -> dict:
    return await KonzertaScraper().run()


@task(retries=1, retry_delay_seconds=60)
async def task_scrape_mitradel() -> dict:
    return await MitradelScraper().run()


@task(retries=1, retry_delay_seconds=60)
async def task_scrape_hiring_room() -> dict:
    return await HiringRoomScraper().run()


@task(retries=1, retry_delay_seconds=60)
async def task_scrape_workday() -> dict:
    return await WorkdayScraper().run()


@task(retries=1, retry_delay_seconds=60)
async def task_scrape_acp() -> dict:
    return await ACPScraper().run()


@task(retries=1, retry_delay_seconds=60)
async def task_scrape_ciudad_del_saber() -> dict:
    return await CiudadDelSaberScraper().run()


@task
async def task_enrich_recent_jobs(limit: int = 200) -> int:
    sb = get_supabase_admin()
    rows = (
        sb.table("jobs")
        .select("id")
        .eq("is_active", True)
        .is_("experience_level", "null")
        .order("scraped_at", desc=True)
        .limit(limit)
        .execute()
        .data
        or []
    )
    n = 0
    for r in rows:
        try:
            await enrich_job(r["id"], sb)
            n += 1
        except Exception as e:
            logger.warning("enrich_fail", job=r["id"], error=str(e))
    return n


@task
def task_embed_pending_jobs(limit: int = 500) -> int:
    sb = get_supabase_admin()
    rows = (
        sb.table("jobs")
        .select("id")
        .eq("is_active", True)
        .is_("embedding", "null")
        .limit(limit)
        .execute()
        .data
        or []
    )
    return embed_jobs_batch([r["id"] for r in rows], sb)


@task
async def task_match_all() -> dict:
    return await full_matching_all_candidates()


@task
def task_score_companies() -> int:
    return compute_all_company_scores()


# ---- Flows ----------------------------------------------------------------

@flow(name="daily_scrape", log_prints=True)
async def daily_scrape() -> dict:
    """Daily: scrape primary portals + enrich + embed."""
    results = await asyncio.gather(
        task_scrape_computrabajo(),
        task_scrape_encuentra24(),
        task_scrape_konzerta(),
        task_scrape_mitradel(),
        task_scrape_hiring_room(),
        task_scrape_workday(),
        task_scrape_acp(),
        task_scrape_ciudad_del_saber(),
        return_exceptions=True,
    )
    enriched = await task_enrich_recent_jobs(limit=300)
    embedded = task_embed_pending_jobs(limit=500)
    return {
        "scrape_results": [str(r) for r in results],
        "enriched": enriched,
        "embedded": embedded,
    }


@flow(name="weekly_full", log_prints=True)
async def weekly_full() -> dict:
    daily = await daily_scrape()
    matched = await task_match_all()
    scored = task_score_companies()
    return {"daily": daily, "matched": matched, "companies_scored": scored}


@flow(name="enrich_only")
async def enrich_only(limit: int = 500) -> int:
    return await task_enrich_recent_jobs(limit=limit)


@flow(name="match_all")
async def match_all() -> dict:
    return await task_match_all()


@flow(name="score_companies")
def score_companies() -> int:
    return task_score_companies()


# ---- CLI ------------------------------------------------------------------

FLOW_MAP = {
    "daily_scrape": daily_scrape,
    "weekly_full": weekly_full,
    "enrich_jobs": enrich_only,
    "match_all": match_all,
    "score_companies": score_companies,
}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--flow", required=True, choices=sorted(FLOW_MAP.keys()))
    args = parser.parse_args()
    fn = FLOW_MAP[args.flow]
    if asyncio.iscoroutinefunction(fn):
        asyncio.run(fn())
    else:
        fn()


if __name__ == "__main__":
    main()
