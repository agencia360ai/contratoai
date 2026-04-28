"""Abstract scraper base. Subclass per portal."""
from __future__ import annotations
import abc
import asyncio
import time
from collections.abc import AsyncIterator
from datetime import datetime, timedelta, timezone
from typing import Any
from unidecode import unidecode
from supabase import Client
from packages.shared.config import settings
from packages.shared.db import get_supabase_admin
from packages.shared.logger import get_logger
from packages.shared.schemas import JobListing
from .http_client import LayeredHttpClient

logger = get_logger(__name__)


class BaseScraper(abc.ABC):
    """Common scraping logic — concrete portals only need fetch + parse."""

    source_name: str = ""
    base_url: str = ""

    def __init__(
        self,
        supabase: Client | None = None,
        max_pages: int | None = None,
        concurrency: int | None = None,
        delay_seconds: float | None = None,
    ) -> None:
        if not self.source_name or not self.base_url:
            raise ValueError(f"{self.__class__.__name__} must set source_name and base_url")
        self.sb: Client = supabase or get_supabase_admin()
        self.max_pages = max_pages or settings.scraper_max_pages
        self.concurrency = concurrency or settings.scraper_concurrency
        self.delay_seconds = delay_seconds or settings.scraper_delay_seconds

    # ---- to override ---------------------------------------------------------

    @abc.abstractmethod
    async def fetch_listing_urls(self, http: LayeredHttpClient) -> AsyncIterator[str]:
        """Yield individual job-detail URLs to parse."""
        ...

    @abc.abstractmethod
    async def parse_job(self, http: LayeredHttpClient, url: str) -> JobListing | None:
        """Convert a job URL into a JobListing or return None on failure."""
        ...

    # ---- Common utilities ---------------------------------------------------

    @staticmethod
    def normalize_company_name(name: str) -> str:
        if not name:
            return ""
        clean = unidecode(name).lower().strip()
        for token in [",", ".", "  ", " s.a.", " sa", " inc", " ltd", " s.r.l", " corp"]:
            clean = clean.replace(token, " ")
        return " ".join(clean.split())

    @staticmethod
    def parse_relative_date(text: str | None) -> datetime | None:
        """Parse "hoy"/"ayer"/"hace N días" → UTC datetime."""
        if not text:
            return None
        t = text.lower().strip()
        now = datetime.now(timezone.utc)
        if "hoy" in t:
            return now
        if "ayer" in t:
            return now - timedelta(days=1)
        import re
        m = re.search(r"hace\s+(\d+)\s+(d[ií]a|hora|semana|mes)", t)
        if not m:
            return None
        n = int(m.group(1))
        unit = m.group(2)
        if "hora" in unit:
            return now - timedelta(hours=n)
        if "d" in unit:
            return now - timedelta(days=n)
        if "semana" in unit:
            return now - timedelta(weeks=n)
        if "mes" in unit:
            return now - timedelta(days=30 * n)
        return None

    @staticmethod
    def parse_salary(text: str | None) -> tuple[float | None, float | None, str]:
        """Crude salary extractor for common Panama formats."""
        import re
        if not text:
            return None, None, "PAB"
        cur = "PAB"
        if "USD" in text or "$" in text:
            cur = "USD"
        # Strip thousand separators and find numbers ≥ 50
        nums_raw = re.findall(r"[0-9][\d.,]*", text)
        vals: list[float] = []
        for n in nums_raw:
            cleaned = n.replace(".", "").replace(",", ".")
            try:
                v = float(cleaned)
                if v >= 50:
                    vals.append(v)
            except ValueError:
                continue
        vals.sort()
        if len(vals) >= 2:
            return vals[0], vals[-1], cur
        if len(vals) == 1:
            return vals[0], vals[0], cur
        return None, None, cur

    # ---- Persistence --------------------------------------------------------

    async def upsert_company(self, name: str) -> str | None:
        """Find or create company; return its id."""
        norm = self.normalize_company_name(name)
        if not norm:
            return None
        try:
            existing = (
                self.sb.table("companies")
                .select("id")
                .eq("normalized_name", norm)
                .limit(1)
                .execute()
            )
            if existing.data:
                return existing.data[0]["id"]
            new = (
                self.sb.table("companies")
                .insert({"name": name.strip(), "normalized_name": norm})
                .execute()
            )
            return new.data[0]["id"] if new.data else None
        except Exception as e:
            logger.warning("upsert_company_fail", name=name, error=str(e))
            return None

    async def save(self, job: JobListing) -> bool:
        """Persist a JobListing. Returns True on success."""
        company_id = await self.upsert_company(job.company_name)

        payload = job.model_dump(mode="json", exclude_none=False)
        payload["company_id"] = company_id
        payload["fingerprint"] = job.fingerprint
        payload["is_active"] = True
        payload.pop("company_name", None)

        # Truncate raw_html to keep row sizes manageable
        if payload.get("raw_html") and len(payload["raw_html"]) > 200_000:
            payload["raw_html"] = payload["raw_html"][:200_000]

        try:
            self.sb.table("jobs").upsert(payload, on_conflict="fingerprint").execute()
            return True
        except Exception as e:
            logger.exception("job_save_fail", url=job.url, error=str(e))
            return False

    async def audit_scrape(
        self,
        url: str,
        ok: bool,
        status_code: int | None = None,
        bytes_: int | None = None,
        duration_ms: int | None = None,
        error: str | None = None,
    ) -> None:
        try:
            self.sb.table("raw_scrapes").insert(
                {
                    "source": self.source_name,
                    "url": url,
                    "status_code": status_code,
                    "bytes": bytes_,
                    "duration_ms": duration_ms,
                    "ok": ok,
                    "error": error,
                }
            ).execute()
        except Exception as e:
            logger.debug("audit_skip", error=str(e))

    # ---- Run loop -----------------------------------------------------------

    async def run(self) -> dict[str, int | str]:
        ok = fail = 0
        started = time.time()
        async with LayeredHttpClient(concurrency=self.concurrency) as http:
            async for url in self.fetch_listing_urls(http):
                t0 = time.time()
                try:
                    job = await self.parse_job(http, url)
                except Exception as e:
                    logger.exception("parse_exception", url=url, error=str(e))
                    fail += 1
                    await self.audit_scrape(url, ok=False, error=str(e)[:500])
                    continue

                duration_ms = int((time.time() - t0) * 1000)
                if job:
                    saved = await self.save(job)
                    if saved:
                        ok += 1
                        await self.audit_scrape(url, ok=True, duration_ms=duration_ms)
                    else:
                        fail += 1
                        await self.audit_scrape(url, ok=False, duration_ms=duration_ms, error="save_failed")
                else:
                    fail += 1
                    await self.audit_scrape(url, ok=False, duration_ms=duration_ms, error="parse_returned_none")

                await asyncio.sleep(self.delay_seconds)

        elapsed = round(time.time() - started, 1)
        result = {"source": self.source_name, "ok": ok, "fail": fail, "elapsed_s": elapsed}
        logger.info("scrape_complete", **result)
        return result
