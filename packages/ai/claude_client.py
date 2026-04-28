"""Claude client with cache and high-level NLP helpers."""
from __future__ import annotations
import asyncio
import hashlib
import json
from functools import lru_cache
from typing import Any
import anthropic
from supabase import Client
from packages.shared.config import settings
from packages.shared.db import get_supabase_admin
from packages.shared.logger import get_logger
from .prompts.system_prompts import (
    PROMPT_VERSION,
    SYSTEM_BENEFITS_EXTRACT,
    SYSTEM_LEVEL_CLASSIFY,
    SYSTEM_SALARY_ESTIMATE,
    SYSTEM_SKILLS_EXTRACT,
    USER_LEVEL_TEMPLATE,
    USER_SKILLS_TEMPLATE,
)

logger = get_logger(__name__)


@lru_cache(maxsize=1)
def get_anthropic() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


def _cache_key(system: str, user: str, model: str) -> str:
    blob = f"{PROMPT_VERSION}|{model}|{system}|{user}"
    return hashlib.sha256(blob.encode()).hexdigest()


async def cached_call(
    system: str,
    user: str,
    model: str | None = None,
    max_tokens: int = 1024,
    temperature: float = 0.0,
    sb: Client | None = None,
    use_prompt_cache: bool = True,
) -> str:
    """LLM call with persistent cache in Supabase + Anthropic prompt caching."""
    sb = sb or get_supabase_admin()
    model = model or settings.claude_model_heavy
    key = _cache_key(system, user, model)

    # Persistent cache check
    try:
        hit = sb.table("nlp_cache").select("output").eq("key", key).limit(1).execute()
        if hit.data:
            return hit.data[0]["output"]
    except Exception as e:
        logger.debug("nlp_cache_read_fail", error=str(e))

    client = get_anthropic()

    # Anthropic prompt caching: mark system as cacheable
    sys_blocks = (
        [{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}]
        if use_prompt_cache
        else system
    )

    last_err: Exception | None = None
    for attempt in range(4):
        try:
            r = await asyncio.to_thread(
                client.messages.create,
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=sys_blocks,
                messages=[{"role": "user", "content": user}],
            )
            out = r.content[0].text
            try:
                sb.table("nlp_cache").upsert(
                    {
                        "key": key,
                        "model": model,
                        "input_tokens": r.usage.input_tokens,
                        "output_tokens": r.usage.output_tokens,
                        "output": out,
                    }
                ).execute()
            except Exception as e:
                logger.debug("nlp_cache_write_fail", error=str(e))
            return out
        except anthropic.RateLimitError as e:
            last_err = e
            await asyncio.sleep(2**attempt)
        except anthropic.APIError as e:
            last_err = e
            if attempt < 2:
                await asyncio.sleep(1 + attempt)
            else:
                raise
    raise RuntimeError(f"Claude call failed after retries: {last_err}")


def _parse_json_lenient(raw: str) -> dict | list | None:
    """Best-effort JSON extractor for LLM responses with stray text."""
    raw = (raw or "").strip()
    try:
        return json.loads(raw)
    except Exception:
        pass
    # Find outermost JSON
    start = min((i for i in (raw.find("{"), raw.find("[")) if i >= 0), default=-1)
    end = max(raw.rfind("}"), raw.rfind("]"))
    if start < 0 or end < 0 or end <= start:
        return None
    try:
        return json.loads(raw[start : end + 1])
    except Exception:
        return None


# ---------- High-level helpers ----------------------------------------------

async def extract_skills(description: str, sb: Client | None = None) -> dict:
    raw = await cached_call(
        system=SYSTEM_SKILLS_EXTRACT,
        user=USER_SKILLS_TEMPLATE.format(description=(description or "")[:6000]),
        model=settings.claude_model_fast,
        max_tokens=600,
        sb=sb,
    )
    parsed = _parse_json_lenient(raw)
    if isinstance(parsed, dict):
        return {
            "hard_skills": parsed.get("hard_skills", []),
            "soft_skills": parsed.get("soft_skills", []),
            "tools": parsed.get("tools", []),
            "languages": parsed.get("languages", []),
        }
    return {"hard_skills": [], "soft_skills": [], "tools": [], "languages": []}


async def categorize_level(title: str, description: str, sb: Client | None = None) -> str:
    raw = await cached_call(
        system=SYSTEM_LEVEL_CLASSIFY,
        user=USER_LEVEL_TEMPLATE.format(title=title or "", description=(description or "")[:3000]),
        model=settings.claude_model_fast,
        max_tokens=10,
        sb=sb,
    )
    val = (raw or "").strip().lower().split()[0] if raw else "mid"
    val = val.strip(".,!?:")
    return val if val in {"intern", "junior", "mid", "senior", "lead", "exec"} else "mid"


async def extract_benefits(text: str, sb: Client | None = None) -> list[str]:
    raw = await cached_call(
        system=SYSTEM_BENEFITS_EXTRACT,
        user=(text or "")[:5000],
        model=settings.claude_model_fast,
        max_tokens=300,
        sb=sb,
    )
    parsed = _parse_json_lenient(raw)
    if isinstance(parsed, dict):
        return parsed.get("benefits", []) or []
    return []


async def estimate_salary(
    title: str, description: str, level: str, sb: Client | None = None
) -> dict:
    user = f"Título: {title}\nNivel: {level}\nDescripción: {(description or '')[:4000]}"
    raw = await cached_call(
        system=SYSTEM_SALARY_ESTIMATE,
        user=user,
        model=settings.claude_model_heavy,
        max_tokens=200,
        sb=sb,
    )
    parsed = _parse_json_lenient(raw)
    if isinstance(parsed, dict):
        return {
            "min": parsed.get("min"),
            "max": parsed.get("max"),
            "currency": parsed.get("currency", "USD"),
            "confidence": parsed.get("confidence", 0),
            "explicit": parsed.get("explicit", False),
        }
    return {"min": None, "max": None, "currency": "USD", "confidence": 0, "explicit": False}


async def enrich_job(job_id: str, sb: Client | None = None) -> dict[str, Any]:
    """Run all NLP enrichments on a single job and persist back."""
    sb = sb or get_supabase_admin()
    job = sb.table("jobs").select("id,title,description").eq("id", job_id).single().execute().data
    if not job:
        return {"ok": False, "reason": "job_not_found"}
    desc = job.get("description") or ""
    title = job.get("title") or ""
    if len(desc) < 40:
        return {"ok": False, "reason": "description_too_short"}

    # Run independent calls in parallel
    skills, level, benefits = await asyncio.gather(
        extract_skills(desc, sb),
        categorize_level(title, desc, sb),
        extract_benefits(desc, sb),
    )
    sal = await estimate_salary(title, desc, level, sb)

    update: dict[str, Any] = {
        "skills_extracted": (skills.get("hard_skills") or []) + (skills.get("tools") or []),
        "languages_required": skills.get("languages", []),
        "benefits_extracted": benefits,
        "experience_level": level,
    }
    # Only fill salary fields if not explicit on the row already
    existing = (
        sb.table("jobs").select("salary_min,salary_max").eq("id", job_id).single().execute().data
    )
    if (
        sal.get("min")
        and not (existing and existing.get("salary_min"))
        and sal.get("confidence", 0) >= 0.5
    ):
        update["salary_min"] = sal["min"]
        update["salary_max"] = sal["max"]
        update["salary_currency"] = sal.get("currency", "USD")

    sb.table("jobs").update(update).eq("id", job_id).execute()
    return {"ok": True, "job_id": job_id, "skills_count": len(update["skills_extracted"])}
