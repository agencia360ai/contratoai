"""Scraper for MITRADEL — Panamá's Ministry of Labor jobs board.

Stack: WordPress + WP Job Manager. We use the REST API at /wp-json/wp/v2/job-listings
when available, otherwise the HTML listing.

Note: empleospanama.gob.pa has been intermittently in maintenance through
2024-2026; the scraper logs and continues silently when it cannot reach the
site so the orchestrator does not fail the whole pipeline.
"""
from __future__ import annotations
import asyncio
import re
from collections.abc import AsyncIterator
from datetime import datetime
from urllib.parse import urljoin
from selectolax.parser import HTMLParser
from packages.scrapers.base import BaseScraper, LayeredHttpClient
from packages.shared.logger import get_logger
from packages.shared.schemas import JobListing

logger = get_logger(__name__)


class MitradelScraper(BaseScraper):
    source_name = "mitradel_pa"
    base_url = "https://empleospanama.gob.pa"
    list_path = "/lista-de-empleos/"
    api_path = "/wp-json/wp/v2/job_listing"

    async def fetch_listing_urls(self, http: LayeredHttpClient) -> AsyncIterator[str]:
        # Try REST API first (much more reliable when available)
        for page in range(1, self.max_pages + 1):
            api_url = f"{self.base_url}{self.api_path}?per_page=20&page={page}"
            data = await http.fetch_json(api_url)
            if data and isinstance(data, list) and data:
                for item in data:
                    link = item.get("link")
                    if link:
                        yield link
                continue
            elif page > 1:
                break

            # Fallback to HTML
            list_url = (
                urljoin(self.base_url, self.list_path)
                if page == 1
                else f"{self.base_url}{self.list_path}page/{page}/"
            )
            html = await http.fetch(list_url)
            if not html:
                break
            tree = HTMLParser(html)
            cards = tree.css("li.job_listing a") or tree.css("a.job_listing-clickbox")
            seen = set()
            found = 0
            for c in cards:
                href = c.attributes.get("href", "")
                if href and href not in seen:
                    seen.add(href)
                    yield href
                    found += 1
            if found == 0:
                break
            await asyncio.sleep(0.6)

    async def parse_job(self, http: LayeredHttpClient, url: str) -> JobListing | None:
        html = await http.fetch(url)
        if not html:
            return None
        tree = HTMLParser(html)

        title = self._t(tree, "h1.job_listing-title, h1.entry-title, h1")
        if not title:
            return None
        company = (
            self._t(tree, ".job-company-name, .job_listing-company strong")
            or self._t(tree, ".company strong")
            or "Empleador del MITRADEL"
        )
        location = self._t(tree, ".job-location, .job_listing-location")
        description = self._t(tree, "div.job_description, .job-description") or self._t(
            tree, "div.entry-content"
        )
        salary_text = self._t(tree, ".job-salary, .salary")
        smin, smax, cur = self.parse_salary(salary_text)
        date_text = self._t(tree, "time, .job-date, .date")
        posted = None
        if date_text:
            try:
                posted = datetime.fromisoformat(date_text.replace("Z", "+00:00"))
            except Exception:
                posted = self.parse_relative_date(date_text)

        m = re.search(r"/job/([^/]+)/?", url) or re.search(r"[?&]p=(\d+)", url)
        sid = m.group(1) if m else url.rstrip("/").rsplit("/", 1)[-1]

        return JobListing(
            source=self.source_name,
            source_id=sid,
            url=url,
            title=title,
            company_name=company,
            location=location,
            salary_min=smin,
            salary_max=smax,
            salary_currency=cur,
            description=description,
            posted_at=posted,
            raw_html=html[:200_000],
        )

    @staticmethod
    def _t(tree, css):
        n = tree.css_first(css)
        return n.text(strip=True) if n else None


if __name__ == "__main__":
    import asyncio as _a
    _a.run(MitradelScraper().run())
