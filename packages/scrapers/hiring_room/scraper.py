"""Generic scraper for Hiring Room — covers Banco General, Banistmo, BAC,
Konzerta Selecta, and any company using {tenant}.hiringroom.com.

Most tenants expose a public API:
    GET https://{tenant}.hiringroom.com/api/v1/jobs/published
returning a JSON array of jobs. When that's not present we fall back to the
embedded `__INITIAL_STATE__` JSON in the SPA shell.
"""
from __future__ import annotations
import asyncio
import json
import re
from collections.abc import AsyncIterator
from datetime import datetime
from selectolax.parser import HTMLParser
from packages.scrapers.base import BaseScraper, LayeredHttpClient
from packages.shared.logger import get_logger
from packages.shared.schemas import JobListing

logger = get_logger(__name__)

# Tenants known to operate in Panamá. Easy to extend.
PANAMA_TENANTS: dict[str, dict] = {
    "bancogeneral": {"company": "Banco General", "industry": "Banca"},
    "banistmo": {"company": "Banистmo", "industry": "Banca"},
    "baccredomatic": {"company": "BAC Credomatic", "industry": "Banca"},
    "konzertaselecta": {"company": "Konzerta Selecta", "industry": "Recruiting"},
    "globalbank": {"company": "Global Bank", "industry": "Banca"},
    "copaairlines": {"company": "Copa Airlines", "industry": "Aviación"},
    "tigo": {"company": "Tigo Panamá", "industry": "Telecom"},
}


class HiringRoomScraper(BaseScraper):
    source_name = "hiring_room"
    base_url = "https://hiringroom.com"

    def __init__(self, tenants: dict | None = None, **kwargs) -> None:
        super().__init__(**kwargs)
        self.tenants = tenants or PANAMA_TENANTS

    async def fetch_listing_urls(self, http: LayeredHttpClient) -> AsyncIterator[str]:
        # We yield "tenant://job_id" tokens; parse_job decodes them.
        for tenant, meta in self.tenants.items():
            api_url = f"https://{tenant}.hiringroom.com/api/v1/jobs/published"
            data = await http.fetch_json(api_url)
            jobs = []
            if isinstance(data, list):
                jobs = data
            elif isinstance(data, dict):
                jobs = data.get("jobs", []) or data.get("data", [])

            if not jobs:
                # Fallback: grab the SPA shell and extract __INITIAL_STATE__
                shell_url = f"https://{tenant}.hiringroom.com/jobs"
                html = await http.fetch(shell_url)
                if html:
                    m = re.search(r"__INITIAL_STATE__\s*=\s*({.+?});", html, re.DOTALL)
                    if m:
                        try:
                            state = json.loads(m.group(1))
                            jobs = state.get("jobs", {}).get("list", []) or state.get("data", {}).get(
                                "jobs", []
                            )
                        except Exception:
                            jobs = []

            logger.info("hiring_room_tenant_jobs", tenant=tenant, count=len(jobs))
            for j in jobs:
                jid = j.get("id") or j.get("_id") or j.get("uuid")
                if jid:
                    # Encode all info we need into the URL so parse_job is stateless
                    payload = {
                        "tenant": tenant,
                        "company": meta["company"],
                        "industry": meta["industry"],
                        "job": j,
                    }
                    yield f"hr://{tenant}/{jid}#{json.dumps(payload, ensure_ascii=False)}"
            await asyncio.sleep(0.4)

    async def parse_job(self, http: LayeredHttpClient, url: str) -> JobListing | None:
        if not url.startswith("hr://"):
            return None
        try:
            payload = json.loads(url.split("#", 1)[1])
        except Exception as e:
            logger.warning("hr_payload_decode_fail", error=str(e))
            return None

        tenant = payload["tenant"]
        company = payload["company"]
        industry = payload.get("industry")
        j = payload["job"]

        title = j.get("title") or j.get("name") or ""
        if not title:
            return None
        sid = str(j.get("id") or j.get("_id"))
        location = (
            j.get("location")
            or (j.get("city", {}) or {}).get("name")
            or (j.get("country", {}) or {}).get("name")
            or "Panamá"
        )
        description = j.get("description") or j.get("descriptionHtml") or ""
        smin = j.get("salaryMin") or (j.get("salary", {}) or {}).get("min")
        smax = j.get("salaryMax") or (j.get("salary", {}) or {}).get("max")
        cur = (j.get("salary", {}) or {}).get("currency") or "USD"

        posted = None
        if j.get("publishedAt") or j.get("createdAt"):
            try:
                posted = datetime.fromisoformat(
                    str(j.get("publishedAt") or j.get("createdAt")).replace("Z", "+00:00")
                )
            except Exception:
                pass

        modality = None
        mod = (j.get("workMode") or j.get("modality") or "").lower()
        if "remoto" in mod or "remote" in mod:
            modality = "remote"
        elif "hibrid" in mod or "hybrid" in mod:
            modality = "hybrid"
        elif "presencial" in mod or "onsite" in mod:
            modality = "onsite"

        permalink = j.get("permalink") or j.get("url") or f"https://{tenant}.hiringroom.com/jobs/{sid}"

        return JobListing(
            source=f"hiring_room_{tenant}",
            source_id=sid,
            url=permalink,
            title=title.strip(),
            company_name=company,
            location=str(location),
            salary_min=float(smin) if smin else None,
            salary_max=float(smax) if smax else None,
            salary_currency=cur,
            description=description,
            modality=modality,
            industry=industry,
            posted_at=posted,
            extra={"hiring_room_tenant": tenant, "raw": j},
        )


if __name__ == "__main__":
    import asyncio as _a
    _a.run(HiringRoomScraper().run())
