"""Scraper for Autoridad del Canal de Panamá (ACP).

Site: empleos.pancanal.com
Tech: SPA but server-renders job links + JSON-LD on detail pages.
Volume: ~30-50 vacantes premium activas.
"""
from __future__ import annotations
import asyncio
import json
import re
from collections.abc import AsyncIterator
from datetime import datetime
from urllib.parse import urljoin
from curl_cffi import requests as cffi_req
from packages.scrapers.base import BaseScraper, LayeredHttpClient
from packages.shared.logger import get_logger
from packages.shared.schemas import JobListing

logger = get_logger(__name__)


class ACPScraper(BaseScraper):
    source_name = "acp_pa"
    base_url = "https://empleos.pancanal.com"

    async def fetch_listing_urls(self, http: LayeredHttpClient) -> AsyncIterator[str]:
        seen: set[str] = set()
        for page in range(1, self.max_pages + 1):
            url = f"{self.base_url}/jobs?page={page}"
            try:
                r = await asyncio.to_thread(
                    cffi_req.get, url, impersonate="chrome124", timeout=20
                )
                if r.status_code != 200:
                    break
            except Exception as e:
                logger.warning("acp_listing_fail", page=page, error=str(e))
                break

            hrefs = set(re.findall(r'href="(/job/[^"]+)"', r.text))
            new = hrefs - seen
            if not new:
                break
            seen.update(new)
            for h in new:
                yield urljoin(self.base_url, h)
            await asyncio.sleep(0.6)

    async def parse_job(self, http: LayeredHttpClient, url: str) -> JobListing | None:
        try:
            r = await asyncio.to_thread(
                cffi_req.get, url, impersonate="chrome124", timeout=20
            )
        except Exception:
            return None
        if r.status_code != 200:
            return None
        html = r.text

        # JSON-LD
        m = re.search(
            r"<script[^>]*application/ld\+json[^>]*>(.+?)</script>",
            html,
            re.DOTALL,
        )
        if m:
            try:
                data = json.loads(m.group(1))
                if isinstance(data, list):
                    data = next(
                        (d for d in data if isinstance(d, dict) and d.get("@type") == "JobPosting"),
                        None,
                    )
                if isinstance(data, dict) and data.get("@type") == "JobPosting":
                    return self._from_jsonld(url, data, html)
            except Exception:
                pass

        # Extremely basic fallback (most ACP have JSON-LD)
        title_m = re.search(r"<h1[^>]*>([^<]+)</h1>", html) or re.search(
            r'<meta[^>]+property="og:title"[^>]+content="([^"]+)"', html
        )
        if not title_m:
            return None

        sid_m = re.search(r"-jid-(\d+)", url)
        sid = sid_m.group(1) if sid_m else url.rsplit("/", 1)[-1]

        return JobListing(
            source=self.source_name,
            source_id=str(sid),
            url=url,
            title=title_m.group(1).strip(),
            company_name="Autoridad del Canal de Panamá",
            location="Panamá",
            description=None,
            raw_html=html[:100_000],
        )

    def _from_jsonld(self, url: str, d: dict, html: str) -> JobListing:
        title = (d.get("title") or "").strip()
        org = d.get("hiringOrganization") or {}
        company = (org.get("name") if isinstance(org, dict) else str(org)) or "Autoridad del Canal de Panamá"

        loc = d.get("jobLocation") or {}
        if isinstance(loc, list):
            loc = loc[0] if loc else {}
        addr = loc.get("address", {}) if isinstance(loc, dict) else {}
        location = addr.get("addressLocality") or addr.get("addressRegion") or "Panamá"

        sal = d.get("baseSalary") or {}
        smin = smax = None
        cur = "USD"
        if isinstance(sal, dict):
            v = sal.get("value", {})
            if isinstance(v, dict):
                try:
                    smin = float(v.get("minValue")) if v.get("minValue") else None
                    smax = float(v.get("maxValue")) if v.get("maxValue") else smin
                except Exception:
                    pass
            cur = sal.get("currency") or cur

        posted = None
        if d.get("datePosted"):
            try:
                posted = datetime.fromisoformat(str(d["datePosted"]).replace("Z", "+00:00"))
            except Exception:
                pass

        sid_m = re.search(r"-jid-(\d+)", url)
        sid = sid_m.group(1) if sid_m else (
            d.get("identifier", {}).get("value") if isinstance(d.get("identifier"), dict) else url.rsplit("/", 1)[-1]
        )

        contract = d.get("employmentType")
        if isinstance(contract, list):
            contract = contract[0] if contract else None

        return JobListing(
            source=self.source_name,
            source_id=str(sid),
            url=url,
            title=title,
            company_name=str(company),
            location=str(location),
            salary_min=smin,
            salary_max=smax,
            salary_currency=cur,
            description=d.get("description"),
            contract_type=contract,
            modality="remote" if d.get("jobLocationType") == "TELECOMMUTE" else None,
            posted_at=posted,
            industry="Logística / Maritime",
            raw_html=html[:200_000],
        )


if __name__ == "__main__":
    import asyncio as _a
    _a.run(ACPScraper().run())
