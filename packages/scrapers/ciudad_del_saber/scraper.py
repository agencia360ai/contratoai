"""Scraper for Ciudad del Saber (Panamá).

Site: https://ciudaddelsaber.org/empleos/
Tech: WordPress (Avada theme con custom post type "empleo"). Cada vacante
      tiene su propio detalle bajo /empleo/<slug>/. Algunas se publican
      como link externo a Hiring Room/Workable; en ese caso el scraper
      registra solo el listing card y deja que esos portales se encarguen
      de la deduplicación (vía fingerprint = source+source_id+title+company).

NOTA: si la URL pública cambia, ajusta `LISTING_URLS`. Probar con:
    uv run python -m packages.scrapers.ciudad_del_saber.scraper
"""
from __future__ import annotations
import asyncio
import re
from collections.abc import AsyncIterator
from urllib.parse import urljoin
from curl_cffi import requests as cffi_req
from packages.scrapers.base import BaseScraper, LayeredHttpClient
from packages.shared.logger import get_logger
from packages.shared.schemas import JobListing

logger = get_logger(__name__)


# Múltiples patrones de URL conocidos: WordPress + Avada suelen exponer
# /empleos/ o /bolsa-de-empleo/ con paginación ?fwp_paged=N.
LISTING_URLS = [
    "https://ciudaddelsaber.org/empleos/",
    "https://ciudaddelsaber.org/bolsa-de-empleo/",
]

JOB_HREF_RE = re.compile(r'href="(https?://[^"]*ciudaddelsaber\.org/empleo[^"]+)"')
TITLE_RE = re.compile(r"<h1[^>]*>([^<]+)</h1>", re.I)
OG_TITLE_RE = re.compile(
    r'<meta[^>]+property="og:title"[^>]+content="([^"]+)"', re.I
)
OG_DESC_RE = re.compile(
    r'<meta[^>]+property="og:description"[^>]+content="([^"]+)"', re.I
)
COMPANY_RE = re.compile(r"empresa[:\s]*</[^>]+>\s*<[^>]+>([^<]+)<", re.I)


class CiudadDelSaberScraper(BaseScraper):
    source_name = "ciudad_del_saber"
    base_url = "https://ciudaddelsaber.org"

    async def fetch_listing_urls(self, http: LayeredHttpClient) -> AsyncIterator[str]:
        seen: set[str] = set()
        for base in LISTING_URLS:
            for page in range(1, self.max_pages + 1):
                url = base if page == 1 else f"{base}page/{page}/"
                try:
                    r = await asyncio.to_thread(
                        cffi_req.get, url, impersonate="chrome124", timeout=20
                    )
                except Exception as e:
                    logger.debug("cds_listing_fail", page=page, error=str(e))
                    break
                if r.status_code == 404:
                    break
                if r.status_code != 200:
                    logger.debug("cds_listing_status", page=page, code=r.status_code)
                    break

                hrefs = set(JOB_HREF_RE.findall(r.text))
                # Fallback: relativos /empleo/...
                hrefs.update(
                    urljoin(self.base_url, h)
                    for h in re.findall(r'href="(/empleo/[^"]+)"', r.text)
                )
                new = hrefs - seen
                if not new:
                    break
                seen.update(new)
                for h in new:
                    yield h
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

        m = TITLE_RE.search(html) or OG_TITLE_RE.search(html)
        if not m:
            return None
        title = re.sub(r"\s+", " ", m.group(1)).strip()
        if not title:
            return None

        desc_m = OG_DESC_RE.search(html)
        description = desc_m.group(1).strip() if desc_m else None

        company_m = COMPANY_RE.search(html)
        company = company_m.group(1).strip() if company_m else "Ciudad del Saber"

        sid = url.rstrip("/").rsplit("/", 1)[-1]

        # Salario heurístico
        salary_min, salary_max, currency = self.parse_salary(html)

        return JobListing(
            source=self.source_name,
            source_id=sid,
            url=url,
            title=title,
            company_name=company,
            location="Ciudad del Saber, Clayton",
            salary_min=salary_min,
            salary_max=salary_max,
            salary_currency=currency,
            description=description,
            industry="Educación / Innovación",
            raw_html=html[:200_000],
        )


if __name__ == "__main__":
    asyncio.run(CiudadDelSaberScraper().run())
