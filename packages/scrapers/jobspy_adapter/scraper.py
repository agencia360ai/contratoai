"""Scraper adapter using JobSpy library.

JobSpy unifies LinkedIn / Indeed / Glassdoor / Google / ZipRecruiter scraping.
Library: github.com/speedyapply/JobSpy

We use it for sites we can't easily build native scrapers for.

Note: rate-limit conservatively. LinkedIn limits ~30-50 jobs/hour without proxies.
"""
from __future__ import annotations
import asyncio
import hashlib
import re
from datetime import datetime, timezone
from packages.shared.db import get_supabase_admin
from packages.shared.logger import get_logger
from packages.shared.schemas import JobListing

logger = get_logger(__name__)


class JobSpyScraper:
    """Wraps `jobspy.scrape_jobs()` and persists to Supabase."""

    def __init__(
        self,
        sites: list[str] | None = None,
        search_terms: list[str] | None = None,
        location: str = "Panama",
        results_wanted: int = 50,
        hours_old: int = 168,
    ) -> None:
        self.sb = get_supabase_admin()
        self.sites = sites or ["indeed", "linkedin"]
        self.search_terms = search_terms or [
            "developer", "analyst", "engineer", "manager", "ventas",
            "contador", "asistente", "ejecutivo", "auxiliar", "supervisor",
        ]
        self.location = location
        self.results_wanted = results_wanted
        self.hours_old = hours_old

    @staticmethod
    def _normalize(name: str) -> str:
        from unidecode import unidecode
        if not name:
            return ""
        clean = unidecode(name).lower().strip()
        for token in [",", ".", "  ", " s.a.", " sa", " inc", " ltd", " s.r.l", " corp"]:
            clean = clean.replace(token, " ")
        return " ".join(clean.split())

    def _upsert_company(self, name: str) -> str | None:
        norm = self._normalize(name)
        if not norm or len(norm) < 2:
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

    @staticmethod
    def _fingerprint(source: str, source_id: str, title: str, company: str) -> str:
        key = f"{source}|{source_id}|{title}|{company}".lower()
        return hashlib.sha256(key.encode()).hexdigest()

    @staticmethod
    def _parse_modality(remote: str | bool | None) -> str | None:
        if isinstance(remote, bool):
            return "remote" if remote else None
        if not remote:
            return None
        s = str(remote).lower()
        if "remot" in s or "telework" in s or "wfh" in s:
            return "remote"
        if "hybrid" in s or "hibrid" in s:
            return "hybrid"
        if "onsite" in s or "in-person" in s or "presencial" in s:
            return "onsite"
        return None

    @staticmethod
    def _parse_level(text: str | None) -> str | None:
        if not text:
            return None
        s = str(text).lower()
        for kw, lvl in [
            ("intern", "intern"), ("pasante", "intern"),
            ("entry", "junior"), ("junior", "junior"), ("trainee", "junior"),
            ("senior", "senior"), ("sr ", "senior"), ("sr.", "senior"),
            ("lead", "lead"), ("principal", "lead"),
            ("director", "exec"), ("vp", "exec"), ("chief", "exec"), ("c-level", "exec"),
            ("manager", "mid"), ("mid", "mid"),
        ]:
            if kw in s:
                return lvl
        return None

    async def run(self) -> dict:
        try:
            from jobspy import scrape_jobs  # type: ignore
        except ImportError:
            logger.error("jobspy_not_installed")
            return {"source": "jobspy", "ok": 0, "fail": 0, "error": "library_not_installed"}

        ok = fail = 0
        for term in self.search_terms:
            logger.info("jobspy_run", term=term, sites=self.sites)
            try:
                df = await asyncio.to_thread(
                    scrape_jobs,
                    site_name=self.sites,
                    search_term=term,
                    location=self.location,
                    results_wanted=self.results_wanted,
                    hours_old=self.hours_old,
                    country_indeed="panama",
                    verbose=0,
                    description_format="markdown",
                )
            except Exception as e:
                logger.warning("jobspy_term_fail", term=term, error=str(e))
                continue

            if df is None or df.empty:
                logger.info("jobspy_term_empty", term=term)
                continue

            logger.info("jobspy_term_results", term=term, count=len(df))
            import pandas as pd
            def _clean(v):
                """Convert pandas NaN/NaT to None, otherwise return value."""
                if v is None:
                    return None
                try:
                    if pd.isna(v):
                        return None
                except (TypeError, ValueError):
                    pass
                return v

            for _, row in df.iterrows():
                try:
                    site = str(_clean(row.get("site")) or "").lower()
                    if not site:
                        continue
                    job_url = _clean(row.get("job_url")) or _clean(row.get("job_url_direct")) or ""
                    company = str(_clean(row.get("company")) or "Empresa confidencial").strip()
                    title = str(_clean(row.get("title")) or "").strip()
                    if not title or not job_url:
                        continue

                    # Source ID from URL or hash
                    m = re.search(r"jk=([a-f0-9]+)|/jobs/view/(\d+)|/job/(\w+)|/(\d{6,})", str(job_url))
                    sid = (m.group(1) or m.group(2) or m.group(3) or m.group(4)) if m else hashlib.md5(str(job_url).encode()).hexdigest()[:16]

                    company_id = self._upsert_company(company)

                    posted = None
                    raw_date = _clean(row.get("date_posted"))
                    if raw_date:
                        try:
                            posted = datetime.fromisoformat(str(raw_date).replace("Z","+00:00")).astimezone(timezone.utc)
                        except Exception:
                            try:
                                posted = datetime.strptime(str(raw_date)[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
                            except Exception:
                                pass

                    description = str(_clean(row.get("description")) or "")[:8000]
                    location = str(_clean(row.get("location")) or "Panamá")
                    smin = _clean(row.get("min_amount"))
                    smax = _clean(row.get("max_amount"))
                    cur = _clean(row.get("currency")) or "USD"
                    salary_period = _clean(row.get("interval")) or "monthly"
                    # JobSpy returns yearly often — convert to monthly
                    if salary_period == "yearly":
                        if smin: smin = round(float(smin) / 12, 2)
                        if smax: smax = round(float(smax) / 12, 2)
                        salary_period = "monthly"

                    job = JobListing(
                        source=f"jobspy_{site}",
                        source_id=str(sid),
                        url=str(job_url),
                        title=title,
                        company_name=company,
                        location=location,
                        salary_min=float(smin) if smin else None,
                        salary_max=float(smax) if smax else None,
                        salary_currency=str(cur).upper() if cur else "USD",
                        salary_period=salary_period,
                        description=description,
                        modality=self._parse_modality(_clean(row.get("is_remote")) or location),
                        contract_type=_clean(row.get("job_type")),
                        experience_level=self._parse_level(title) or self._parse_level(_clean(row.get("job_level"))),
                        posted_at=posted,
                    )

                    payload = job.model_dump(mode="json", exclude_none=False)
                    payload["company_id"] = company_id
                    payload["fingerprint"] = self._fingerprint(job.source, job.source_id, job.title, job.company_name)
                    payload["is_active"] = True
                    payload.pop("company_name", None)
                    payload.pop("raw_html", None)

                    self.sb.table("jobs").upsert(payload, on_conflict="fingerprint").execute()
                    ok += 1
                except Exception as e:
                    logger.warning("jobspy_row_fail", error=str(e))
                    fail += 1

            await asyncio.sleep(1.5)  # be nice between search terms

        result = {"source": "jobspy", "sites": self.sites, "ok": ok, "fail": fail}
        logger.info("jobspy_complete", **result)
        return result


if __name__ == "__main__":
    import asyncio as _a
    _a.run(JobSpyScraper().run())
