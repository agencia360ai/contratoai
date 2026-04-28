"""Konzerta sitemap-based scraper.

Konzerta's main listing is a SPA + Cloudflare. The sitemap is plain XML
and contains 2,800+ job URLs. Each job page is also a SPA but the route
returns the metadata in a meta-tag block + structured data we can parse
via curl_cffi (impersonate=chrome) — no Playwright needed.
"""
from __future__ import annotations
import asyncio
import re
import hashlib
from datetime import datetime, timezone
from typing import AsyncIterator
from curl_cffi import requests as cffi_req
from selectolax.parser import HTMLParser
from packages.scrapers.base import BaseScraper, LayeredHttpClient
from packages.shared.logger import get_logger
from packages.shared.schemas import JobListing

logger = get_logger(__name__)

SITEMAP_URL = "https://www.konzerta.com/sitemap_avisos_bum.xml"


class KonzertaSitemapScraper(BaseScraper):
    source_name = "konzerta_pa"
    base_url = "https://www.konzerta.com"

    def __init__(self, max_jobs: int = 200, **kwargs) -> None:
        super().__init__(**kwargs)
        self.max_jobs = max_jobs

    async def fetch_listing_urls(self, http: LayeredHttpClient) -> AsyncIterator[str]:
        # Use curl_cffi (impersonates Chrome TLS) to bypass Cloudflare
        try:
            r = await asyncio.to_thread(
                cffi_req.get, SITEMAP_URL, impersonate="chrome124", timeout=30
            )
            if r.status_code != 200:
                logger.warning("konzerta_sitemap_fail", status=r.status_code)
                return
            urls = re.findall(r"<loc>([^<]+)</loc>", r.text)
            logger.info("konzerta_sitemap_loaded", count=len(urls))
            count = 0
            for u in urls:
                if "/empleos/" in u and count < self.max_jobs:
                    yield u
                    count += 1
        except Exception as e:
            logger.exception("konzerta_sitemap_exception", error=str(e))

    async def parse_job(self, http: LayeredHttpClient, url: str) -> JobListing | None:
        try:
            r = await asyncio.to_thread(
                cffi_req.get, url, impersonate="chrome124", timeout=20
            )
        except Exception as e:
            logger.debug("konzerta_fetch_fail", url=url, error=str(e))
            return None

        if r.status_code != 200:
            return None

        html = r.text

        # Extract from meta tags (the SPA shell still includes OG/Twitter meta)
        title = self._meta(html, "og:title") or self._meta(html, "twitter:title")
        if not title:
            # Fallback: use URL slug
            slug = url.rstrip("/").rsplit("/", 1)[-1].replace(".html", "")
            slug = re.sub(r"-\d+$", "", slug)
            title = slug.replace("-", " ").title()

        description = (
            self._meta(html, "og:description")
            or self._meta(html, "description")
            or self._meta(html, "twitter:description")
            or ""
        )
        # Try JSON-LD as a bonus
        m = re.search(r"<script[^>]*application/ld\+json[^>]*>(.+?)</script>", html, re.DOTALL)
        if m:
            try:
                import json
                d = json.loads(m.group(1))
                if isinstance(d, list):
                    d = next((x for x in d if isinstance(x, dict) and x.get("@type") == "JobPosting"), None)
                if isinstance(d, dict) and d.get("@type") == "JobPosting":
                    if d.get("description"):
                        description = d["description"]
                    if d.get("title"):
                        title = d["title"]
            except Exception:
                pass

        # Source ID from URL: ...slug-1118259097.html
        m = re.search(r"-(\d{6,})\.html?$", url)
        sid = m.group(1) if m else hashlib.md5(url.encode()).hexdigest()[:16]

        # Extract company from description if mentioned (best-effort)
        company = "Empresa confidencial"
        m = re.search(r"(?:Empresa|Empleador|Compañía):\s*([^\n.]+)", description, re.IGNORECASE)
        if m:
            company = m.group(1).strip()[:80]

        # Crude location extraction
        location = "Panamá"
        for city in ["Ciudad de Panamá", "San Miguelito", "David", "Colón", "Tocumen", "Penonomé", "Santiago"]:
            if city.lower() in description.lower():
                location = city
                break

        return JobListing(
            source=self.source_name,
            source_id=str(sid),
            url=url,
            title=str(title)[:200],
            company_name=company,
            location=location,
            description=description[:8000] if description else None,
            posted_at=None,
            raw_html=html[:200_000] if len(html) > 800 else None,
        )

    @staticmethod
    def _meta(html: str, name: str) -> str | None:
        # Try property="..." first, then name="..."
        for pattern in [
            rf'<meta[^>]+property=["\']{re.escape(name)}["\'][^>]+content=["\']([^"\']+)["\']',
            rf'<meta[^>]+name=["\']{re.escape(name)}["\'][^>]+content=["\']([^"\']+)["\']',
            rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']{re.escape(name)}["\']',
            rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']{re.escape(name)}["\']',
        ]:
            m = re.search(pattern, html, re.IGNORECASE)
            if m:
                return m.group(1)
        return None


if __name__ == "__main__":
    import asyncio as _a
    _a.run(KonzertaSitemapScraper(max_jobs=200).run())
