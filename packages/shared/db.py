"""Supabase + asyncpg helpers."""
from __future__ import annotations
from functools import lru_cache
from supabase import Client, create_client
from .config import settings


@lru_cache(maxsize=1)
def get_supabase_admin() -> Client:
    """Service-role client. Bypasses RLS — use only in trusted contexts."""
    if not (settings.supabase_url and settings.supabase_service_key):
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"
        )
    return create_client(settings.supabase_url, settings.supabase_service_key)


@lru_cache(maxsize=1)
def get_supabase_anon() -> Client:
    """Anon client. RLS-enforced — for app-side reads only."""
    if not (settings.supabase_url and settings.supabase_anon_key):
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_ANON_KEY must be set"
        )
    return create_client(settings.supabase_url, settings.supabase_anon_key)
