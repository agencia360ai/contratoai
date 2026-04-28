"""Conversational onboarding orchestrated by Claude.

The chat itself runs in the frontend, but this module hosts the canonical
prompt logic + helper to build the standardised candidate profile JSON
once the 14 steps are complete.
"""
from __future__ import annotations
import asyncio
import json
from functools import lru_cache
from typing import Any
import anthropic
from packages.shared.config import settings
from packages.shared.logger import get_logger
from .prompts.system_prompts import SYSTEM_ONBOARDING_PANA

logger = get_logger(__name__)


@lru_cache(maxsize=1)
def _client() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


class OnboardingChat:
    """Holds conversation state for one candidate."""

    def __init__(self, history: list[dict] | None = None) -> None:
        self.history: list[dict] = history or []

    def append_user(self, content: str) -> None:
        self.history.append({"role": "user", "content": content})

    def append_assistant(self, content: str) -> None:
        self.history.append({"role": "assistant", "content": content})

    async def next_step(self) -> dict:
        """Ask Pana for next message. Returns parsed JSON output."""
        client = _client()
        r = await asyncio.to_thread(
            client.messages.create,
            model=settings.claude_model_heavy,
            max_tokens=1500,
            temperature=0.4,
            system=[
                {
                    "type": "text",
                    "text": SYSTEM_ONBOARDING_PANA,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=self.history or [{"role": "user", "content": "[start]"}],
        )
        text = r.content[0].text
        self.append_assistant(text)
        return self._parse(text)

    @staticmethod
    def _parse(raw: str) -> dict:
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("```", 2)[1]
            if raw.startswith("json"):
                raw = raw[4:]
        try:
            return json.loads(raw)
        except Exception:
            start = raw.find("{")
            end = raw.rfind("}")
            if start >= 0 and end > start:
                try:
                    return json.loads(raw[start : end + 1])
                except Exception:
                    pass
        # Fallback: treat the whole thing as a free-text message
        return {"step": 0, "message": raw, "input_type": "text", "options": []}


def build_profile_summary(answers: dict[str, Any]) -> dict[str, Any]:
    """Convert the 14 collected answers into the canonical CandidateProfile JSON.

    `answers` is keyed by step id (1..14) and contains the user response.
    """
    big_five = answers.get("big_five_scores") or {}
    riasec = answers.get("riasec_scores") or {}
    return {
        "version": "1.0",
        "personality_big_five": {
            "framework": "BFI-2-S",
            "scores": big_five,
        },
        "vocational_interests_riasec": {
            "framework": "ONET_Mini_IP",
            "scores": riasec,
            "code": _riasec_code(riasec),
        },
        "skills": {
            "technical": answers.get("skills_validated", []),
            "soft": [],
        },
        "experience_summary": {
            "total_years": answers.get("years_experience"),
            "industries": answers.get("industries", []),
        },
        "preferences": {
            "salary_expectation_usd_monthly": {
                "target": answers.get("salary_target"),
                "min": answers.get("salary_min"),
            },
            "modality": answers.get("modality"),
            "industries_interest": answers.get("industries_interest", []),
        },
        "consent": {
            "data_processing": True,
            "ai_matching": answers.get("consent_ai", True),
            "share_with_employers": answers.get("consent_employers", True),
            "leaderboard_public": answers.get("leaderboard_public", False),
        },
    }


def _riasec_code(scores: dict) -> str:
    if not scores:
        return ""
    sortable = [(k, v) for k, v in scores.items() if k in ("R", "I", "A", "S", "E", "C")]
    sortable.sort(key=lambda x: x[1], reverse=True)
    return "".join(k for k, _ in sortable[:3])
