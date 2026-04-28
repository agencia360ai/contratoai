"""Scraper for Konzerta (konzerta.com).

Konzerta is a React SPA powered by the Jobint backend. The most reliable
strategy is to fetch the SSR-rendered listing pages (which include enough
metadata for cards) and then fetch detail pages where JSON-LD is usually
present. If the listing returns a thin shell, we fall back to the rendered
JSON embedded as `window.__APP_DATA__`.
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


class KonzertaScraper(BaseScraper):
    source_name = "konzerta_pa"
    base_url = "https://www.konzerta.com"
    list_path_first = "/empleos.html"
    list_path_paged = "/empleos-pagina-{page}.html"

    async def fetch_listing_urls(self, http: LayeredHttpClient) -> AsyncIterator[str]:
        for page in range(1, self.max_pages + 1):
            url = (
                urljoin(self.base_url, self.list_path_first)
                if page == 1
                else urljoin(self.base_url, self.list_path_paged.format(page=page))
            )
            html = await http.fetch(url)
            if not html:
                break
            tree = HTMLParser(html)
            cards = tree.css("a.aviso") or tree.css("a[href*='/empleo-de-']") or tree.css("a.sc-bmaPmJ")
            seen = set()
            found = 0
            for c in cards:
                href = c.attributes.get("href", "")
                if href and "/empleo-de-" in href and href not in seen:
                    seen.add(href)
                    yield urljoin(self.base_url, href)
                    found += 1
            if found == 0:
                # Try parsing __APP_DATA__ embedded JSON
                m = re.search(r"window\.__APP_DATA__\s*=\s*({.+?});", html, re.DOTALL)
                if m:
                    try:
                        data = json.loads(m.group(1))
                        for ad in self._extract_ads(data):
                            yield urljoin(self.base_url, ad)
                            found += 1
                    except Exception:
                        pass
            if found == 0:
                logger.info("konzerta_listing_end", page=page)
                break
            await asyncio.sleep(0.7)

    @staticmethod
    def _extract_ads(node, results: list | None = None) -> list[str]:
        if results is None:
            results = []
        if isinstance(node, dict):
            for k, v in node.items():
                if k in ("url", "permalink", "href") and isinstance(v, str) and "/empleo-de-" in v:
                    results.append(v)
                else:
                    KonzertaScraper._extract_ads(v, results)
        elif isinstance(node, list):
            for item in node:
                KonzertaScraper._extract_ads(item, results)
        return results

    async def parse_job(self, http: LayeredHttpClient, url: str) -> JobListing | None:
        html = await http.fetch(url)
        if not html:
            return None
        tree = HTMLParser(html)

        # JSON-LD path
        for ld in tree.css('script[type="application/ld+json"]'):
            try:
                data = json.loads(ld.text() or "{}")
                if isinstance(data, list):
                    data = next((d for d in data if isinstance(d, dict) and d.get("@type") == "JobPosting"), None)
                if isinstance(data, dict) and data.get("@type") == "JobPosting":
                    return self._from_jsonld(url, data, html)
            except Exception:
                continue

        # CSS fallback
        title = self._t(tree, "h1.sc-bAeIUo, h1.titulo-aviso, h1")
        if not title:
            return None
        company = self._t(tree, "a.sc-fzqzlV, span.empresa, .nombre-empresa") or "Empresa confidencial"
        location = self._t(tree, ".ubicacion, [data-qa='location']")
        description = self._t(tree, "div.descripcion-aviso, div[data-qa='description']")
        smin, smax, cur = self.parse_salary(self._t(tree, ".salario, .salary"))
        m = re.search(r"-(\d{5,})\.html?$", url)
        sid = m.group(1) if m else url.rsplit("/", 1)[-1].replace(".html", "")
        posted = self.parse_relative_date(self._t(tree, "span.fecha-publicacion"))

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
        sid = ident.get("value") if isinstance(ident, dict) else (str(ident) if ident else url.rsplit("/", 1)[-1])

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
    _a.run(KonzertaScraper().run())
