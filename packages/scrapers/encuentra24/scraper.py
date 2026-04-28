"""Scraper for Encuentra24 Panamá (encuentra24.com/panama-es/empleos).

Pagination: dot-suffix path (.2, .3, ...). Uses Cloudflare-medium so layered
HTTP fallback to curl_cffi or playwright kicks in when needed.
"""
from __future__ import annotations
import asyncio
import json
import re
from collections.abc import AsyncIterator
from datetime import datetime
from urllib.parse import urljoin
from selectolax.parser import HTMLParser
from packages.scrapers.base import BaseScraper, LayeredHttpClient
from packages.shared.logger import get_logger
from packages.shared.schemas import JobListing

logger = get_logger(__name__)


class Encuentra24Scraper(BaseScraper):
    source_name = "encuentra24_pa"
    base_url = "https://www.encuentra24.com"
    list_path = "/panama-es/empleos-ofertas-de-trabajos"

    async def fetch_listing_urls(self, http: LayeredHttpClient) -> AsyncIterator[str]:
        for page in range(1, self.max_pages + 1):
            url = (
                urljoin(self.base_url, self.list_path)
                if page == 1
                else f"{self.base_url}{self.list_path}.{page}"
            )
            html = await http.fetch(url)
            if not html:
                logger.warning("e24_listing_fail", page=page)
                break
            tree = HTMLParser(html)
            # Selectors as of 2026 redesign
            cards = (
                tree.css("a.item-card-link")
                or tree.css("a[href*='/d-'][href*='empleos']")
                or tree.css("div.d3-listing-card a[href*='/empleos-']")
                or tree.css("a[data-qa-id='aditem-link']")
            )
            found = 0
            seen = set()
            for c in cards:
                href = c.attributes.get("href", "")
                if href and ("/empleos-" in href or "/d-" in href) and href not in seen:
                    seen.add(href)
                    yield urljoin(self.base_url, href)
                    found += 1
            if found == 0:
                logger.info("e24_listing_end", page=page)
                break
            await asyncio.sleep(0.6)

    async def parse_job(self, http: LayeredHttpClient, url: str) -> JobListing | None:
        html = await http.fetch(url)
        if not html:
            return None
        tree = HTMLParser(html)

        # Try JSON-LD first (some pages have it)
        for ld in tree.css('script[type="application/ld+json"]'):
            try:
                data = json.loads(ld.text() or "{}")
                if isinstance(data, list):
                    data = next(
                        (d for d in data if isinstance(d, dict) and d.get("@type") == "JobPosting"),
                        None,
                    )
                if isinstance(data, dict) and data.get("@type") == "JobPosting":
                    return self._from_jsonld(url, data, html)
            except Exception:
                continue

        # CSS fallback
        title = (
            self._t(tree, "h1.d3-text-headline-1")
            or self._t(tree, "h1[data-qa-id='ad-title']")
            or self._t(tree, "h1")
        )
        if not title:
            return None
        company = (
            self._t(tree, "span.d3-userInfo-name")
            or self._t(tree, "[data-qa-id='ad-author-name']")
            or "Empresa confidencial"
        )
        location = self._t(tree, "[data-qa-id='ad-location']") or self._t(tree, "span.d3-location-name")
        description = self._t(tree, "div[data-qa-id='ad-description']") or self._t(tree, "div.d3-ad-detail__description")
        salary_text = self._t(tree, "[data-qa-id='ad-price']") or self._t(tree, "span.d3-text-price")
        smin, smax, cur = self.parse_salary(salary_text)
        posted = self.parse_relative_date(self._t(tree, "[data-qa-id='ad-date']"))

        m = re.search(r"-(\d{6,})\.htm", url) or re.search(r"-([\w]+)$", url)
        sid = m.group(1) if m else url.rsplit("/", 1)[-1]

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

    def _from_jsonld(self, url: str, d: dict, html: str) -> JobListing:
        org = d.get("hiringOrganization") or {}
        company = org.get("name") if isinstance(org, dict) else str(org)
        loc = d.get("jobLocation") or {}
        if isinstance(loc, list):
            loc = loc[0] if loc else {}
        addr = loc.get("address", {}) if isinstance(loc, dict) else {}
        location = addr.get("addressLocality") or addr.get("addressRegion")
        sal = d.get("baseSalary") or {}
        smin = smax = None
        cur = "PAB"
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
        ident = d.get("identifier")
        sid = (
            ident.get("value") if isinstance(ident, dict) else (str(ident) if ident else url.rsplit("/", 1)[-1])
        )
        return JobListing(
            source=self.source_name,
            source_id=str(sid),
            url=url,
            title=(d.get("title") or "").strip(),
            company_name=str(company or "Empresa confidencial"),
            location=location,
            salary_min=smin,
            salary_max=smax,
            salary_currency=cur,
            description=d.get("description"),
            posted_at=posted,
            raw_html=html[:200_000],
        )


if __name__ == "__main__":
    import asyncio as _a
    _a.run(Encuentra24Scraper().run())
