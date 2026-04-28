"""Shared Pydantic schemas (job listings, candidate profiles, ...)."""
from __future__ import annotations
import hashlib
from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, Field, field_validator


class JobListing(BaseModel):
    """Canonical normalized job listing produced by every scraper."""
    source: str
    source_id: str
    url: str
    title: str
    company_name: str
    location: str | None = None
    city_id: int | None = None
    salary_min: float | None = None
    salary_max: float | None = None
    salary_currency: str | None = "PAB"
    salary_period: str | None = "monthly"
    description: str | None = None
    requirements_raw: str | None = None
    skills_extracted: list[str] = Field(default_factory=list)
    benefits_extracted: list[str] = Field(default_factory=list)
    languages_required: list[dict[str, Any]] = Field(default_factory=list)
    experience_level: str | None = None
    experience_years_min: float | None = None
    experience_years_max: float | None = None
    contract_type: str | None = None
    modality: str | None = None
    industry: str | None = None
    posted_at: datetime | None = None
    expires_at: datetime | None = None
    scraped_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    raw_html: str | None = None
    extra: dict[str, Any] = Field(default_factory=dict)

    @field_validator("title", "company_name")
    @classmethod
    def strip_text(cls, v: str) -> str:
        return v.strip() if v else v

    @property
    def fingerprint(self) -> str:
        """Stable dedupe key across scraping runs."""
        key = f"{self.source}|{self.source_id}|{self.title}|{self.company_name}".lower()
        return hashlib.sha256(key.encode()).hexdigest()


class CandidateProfile(BaseModel):
    """Standardized candidate output from onboarding (BFI-2-S + RIASEC + skills)."""
    profile_id: str
    version: str = "1.0"
    display_name: str | None = None
    location: str | None = None
    personality_big_five: dict[str, Any] = Field(default_factory=dict)
    vocational_interests_riasec: dict[str, Any] = Field(default_factory=dict)
    skills: dict[str, list[Any]] = Field(default_factory=lambda: {"technical": [], "soft": []})
    experience_summary: dict[str, Any] = Field(default_factory=dict)
    ai_generated_strengths: list[str] = Field(default_factory=list)
    ai_generated_growth_areas: list[str] = Field(default_factory=list)
    occupation_matches: list[dict[str, Any]] = Field(default_factory=list)
    preferences: dict[str, Any] = Field(default_factory=dict)
    consent: dict[str, Any] = Field(default_factory=dict)
