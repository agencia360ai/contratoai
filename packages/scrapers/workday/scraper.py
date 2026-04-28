"""Generic Workday CXS scraper.

Workday tenants expose a stable JSON API:
    POST https://{tenant}.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs

Body filters by location (country UUID for Panamá: 51c97e9e-2c0e-4ce0-...)
and supports pagination via offset/limit.

Used by Tigo, Caterpillar, Maersk, Dell, etc. for their Panamá ops.
"""
from __future__ import annotations
import asyncio
from collections.abc import AsyncIterator
from datetime import datetime
from packages.scrapers.base import BaseScraper, LayeredHttpClient
from packages.shared.logger import get_logger
from packages.shared.schemas import JobListing

logger = get_logger(__name__)

# Country UUID for Panamá (Workday standard)
PANAMA_COUNTRY_UUID = "51c97e9e2c0e4ce0bb56a3c30eb20e95"  # placeholder; override per tenant

# (tenant, site, company_name, industry)
WORKDAY_TENANTS: list[tuple[str, str, str, str]] = [
    # ("tigopanama", "External", "Tigo Panamá", "Telecom"),
    # ("caterpillar", "External", "Caterpillar", "Maquinaria"),
    # ("maersk", "Maersk", "Maersk", "Logística"),
    # ("dell", "External", "Dell Technologies", "Tecnología"),
]


class WorkdayScraper(BaseScraper):
    source_name = "workday"
    base_url = "https://myworkdayjobs.com"

    def __init__(self, tenants: list | None = None, **kwargs) -> None:
        super().__init__(**kwargs)
        self.tenants = tenants or WORKDAY_TENANTS

    async def fetch_listing_urls(self, http: LayeredHttpClient) -> AsyncIterator[str]:
        for tenant, site, company, industry in self.tenants:
            api = f"https://{tenant}.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs"
            offset = 0
            limit = 20
            for _ in range(self.max_pages):
                body = {
                    "appliedFacets": {"locationCountry": [PANAMA_COUNTRY_UUID]},
                    "limit": limit,
                    "offset": offset,
                    "searchText": "",
                }
                data = await http.post_json(
                    api,
                    body,
                    headers={
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                )
                if not isinstance(data, dict):
                    break
                postings = data.get("jobPostings", [])
                if not postings:
                    break
                for p in postings:
                    ext = p.get("externalPath") or p.get("externalUrl")
                    if ext:
                        url = f"https://{tenant}.myworkdayjobs.com{ext}"
                        # Encode metadata for parse_job
                        import json as _j
                        meta = _j.dumps({
                            "tenant": tenant, "site": site, "company": company,
                            "industry": industry, "posting": p,
                        }, ensure_ascii=False)
                        yield f"wd://{tenant}/{p.get('bulletFields', [''])[0]}#{meta}"
                if len(postings) < limit:
                    break
                offset += limit
                await asyncio.sleep(0.4)

    async def parse_job(self, http: LayeredHttpClient, url: str) -> JobListing | None:
        if not url.startswith("wd://"):
            return None
        import json as _j
        try:
            meta = _j.loads(url.split("#", 1)[1])
        except Exception:
            return None

        tenant = meta["tenant"]
        site = meta["site"]
        company = meta["company"]
        industry = meta["industry"]
        p = meta["posting"]

        title = p.get("title")
        if not title:
            return None

        ext = p.get("externalPath", "")
        permalink = f"https://{tenant}.myworkdayjobs.com{ext}"

        # Detail call to /wday/cxs/{tenant}/{site}/job/{externalPath}
        detail_url = f"https://{tenant}.myworkdayjobs.com/wday/cxs/{tenant}/{site}/job{ext}"
        detail = await http.fetch_json(
            detail_url, headers={"Accept": "application/json"}
        )
        description = ""
        location = "Panamá"
        smin = smax = None
        cur = "USD"
        modality = None
        if isinstance(detail, dict):
            jp = detail.get("jobPostingInfo", {}) or detail
            description = jp.get("jobDescription") or jp.get("description") or ""
            location = jp.get("location") or location
            sal = jp.get("salaryRange") or {}
            if isinstance(sal, dict):
                smin = sal.get("minSalary")
                smax = sal.get("maxSalary")
                cur = sal.get("currency") or cur
            time_type = (jp.get("timeType") or "").lower()
            mode = (jp.get("location") or "").lower()
            if "remote" in mode or "telecommute" in mode:
                modality = "remote"
            elif "hybrid" in mode:
                modality = "hybrid"

        sid = p.get("bulletFields", [""])[0] or ext.split("/")[-1]
        posted = None
        posted_str = p.get("postedOn") or (detail.get("jobPostingInfo", {}).get("startDate") if isinstance(detail, dict) else None)
        if posted_str:
            try:
                posted = datetime.fromisoformat(str(posted_str).replace("Z", "+00:00"))
            except Exception:
                posted = self.parse_relative_date(str(posted_str))

        return JobListing(
            source=f"workday_{tenant}",
            source_id=str(sid),
            url=permalink,
            title=title,
            company_name=company,
            location=str(location),
            salary_min=float(smin) if smin else None,
            salary_max=float(smax) if smax else None,
            salary_currency=cur,
            description=description,
            modality=modality,
            industry=industry,
            posted_at=posted,
            extra={"workday_tenant": tenant, "site": site},
        )


if __name__ == "__main__":
    import asyncio as _a
    _a.run(WorkdayScraper().run())
