"""Scraper for Computrabajo Panamá (pa.computrabajo.com).

Strategy: prefer JSON-LD <script type="application/ld+json"> JobPosting blocks.
Fallback to CSS selectors when JSON-LD is missing.
"""
from __future__ import annotations
import asyncio
import json
import re
from collections.abc import AsyncIterator
from datetime import datetime
from urllib.parse import urljoin
from selectolax.parser import HTMLParser, Node
from packages.scrapers.base import BaseScraper, LayeredHttpClient
from packages.shared.logger import get_logger
from packages.shared.schemas import JobListing

logger = get_logger(__name__)


class ComputrabajoPanamaScraper(BaseScraper):
    source_name = "computrabajo_pa"
    base_url = "https://pa.computrabajo.com"
    list_paths = [
        "/empleos-en-panama",
        "/empleos-en-chiriqui",
        "/empleos-en-colon",
        "/empleos-en-veraguas",
        "/empleos-en-cocle",
    ]

    # ---- discovery -----------------------------------------------------------

    async def fetch_listing_urls(self, http: LayeredHttpClient) -> AsyncIterator[str]:
        for path in self.list_paths:
            for page in range(1, self.max_pages + 1):
                url = urljoin(self.base_url, path) if page == 1 else f"{self.base_url}{path}?p={page}"
                html = await http.fetch(url)
                if not html:
                    logger.warning("listing_fetch_fail", path=path, page=page)
                    break
                tree = HTMLParser(html)
                cards = tree.css("article.box_offer, article[data-id]")
                if not cards:
                    cards = tree.css("a.js-o-link")
                found = 0
                for card in cards:
                    href = card.css_first("a.js-o-link") or card.css_first(
                        "a[href*='/ofertas-de-trabajo/']"
                    )
                    link_node = href if href else (card if card.tag == "a" else None)
                    if not link_node:
                        continue
                    link = link_node.attributes.get("href", "")
                    if link and "/ofertas-de-trabajo/" in link:
                        yield urljoin(self.base_url, link)
                        found += 1
                if found == 0:
                    logger.info("listing_end", path=path, last_page=page)
                    break
                await asyncio.sleep(0.5)

    # ---- detail --------------------------------------------------------------

    async def parse_job(self, http: LayeredHttpClient, url: str) -> JobListing | None:
        html = await http.fetch(url)
        if not html:
            return None
        tree = HTMLParser(html)

        # Strategy 1 — JSON-LD JobPosting (preferred, stable across redesigns)
        for ld_node in tree.css('script[type="application/ld+json"]'):
            try:
                raw = ld_node.text() or ""
                if not raw.strip():
                    continue
                data = json.loads(raw)
                if isinstance(data, list):
                    data = next((d for d in data if isinstance(d, dict) and d.get("@type") == "JobPosting"), None)
                if isinstance(data, dict) and data.get("@type") == "JobPosting":
                    return self._from_jsonld(url, data, html)
            except Exception:
                continue

        # Strategy 2 — CSS fallback
        return self._from_css(url, tree, html)

    # ---- internal -----------------------------------------------------------

    @staticmethod
    def _t(tree: HTMLParser | Node, css: str) -> str | None:
        node = tree.css_first(css)
        return node.text(strip=True) if node else None

    def _from_jsonld(self, url: str, d: dict, html: str) -> JobListing:
        title = (d.get("title") or "").strip()
        org = d.get("hiringOrganization") or {}
        company = (
            org.get("name") if isinstance(org, dict) else str(org)
        ) or "Empresa confidencial"

        # Location
        loc = d.get("jobLocation") or {}
        if isinstance(loc, list):
            loc = loc[0] if loc else {}
        addr = loc.get("address", {}) if isinstance(loc, dict) else {}
        location = addr.get("addressLocality") or addr.get("addressRegion")

        # Salary
        sal = d.get("baseSalary") or {}
        smin = smax = None
        cur = "PAB"
        if isinstance(sal, dict):
            v = sal.get("value", {})
            if isinstance(v, dict):
                smin = self._numeric(v.get("minValue"))
                smax = self._numeric(v.get("maxValue")) or smin
            cur = sal.get("currency") or cur

        # Posted at
        posted = None
        if d.get("datePosted"):
            try:
                posted = datetime.fromisoformat(str(d["datePosted"]).replace("Z", "+00:00"))
            except Exception:
                pass

        # ID
        ident = d.get("identifier")
        sid = (
            ident.get("value") if isinstance(ident, dict) else (str(ident) if ident else url.rsplit("/", 1)[-1])
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
            location=location,
            salary_min=smin,
            salary_max=smax,
            salary_currency=cur,
            description=d.get("description"),
            modality="remote" if d.get("jobLocationType") == "TELECOMMUTE" else None,
            contract_type=contract,
            posted_at=posted,
            raw_html=html[:200_000],
        )

    def _from_css(self, url: str, tree: HTMLParser, html: str) -> JobListing | None:
        title = self._t(tree, "h1.fwB.fs24, h1.title, h1")
        if not title:
            return None
        company = (
            self._t(tree, ".box_detail .dIB.fwB")
            or self._t(tree, "header p.fs16 a")
            or self._t(tree, "p.fc_base.t_ellipsis a")
            or "Empresa confidencial"
        )
        location = self._t(tree, "p.mb10.fs16") or self._t(tree, "p[itemprop='jobLocation']")
        description = (
            self._t(tree, "div.detail .fs16")
            or self._t(tree, "div.fs16.mbB")
            or self._t(tree, "p.mbB")
        )
        salary_text = self._t(tree, "div.mbB span.dIB") or self._t(tree, "p.fs13 span")
        smin, smax, cur = self.parse_salary(salary_text)
        posted = self.parse_relative_date(self._t(tree, "p.fs13.fc_aux") or self._t(tree, "span.fc_aux"))

        m = re.search(r"-([0-9A-Fa-f]{16,})", url)
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
    def _numeric(x) -> float | None:
        if x is None:
            return None
        try:
            return float(x)
        except (TypeError, ValueError):
            return None


# ---- CLI entrypoint ---------------------------------------------------------
if __name__ == "__main__":
    import asyncio as _a
    _a.run(ComputrabajoPanamaScraper().run())
