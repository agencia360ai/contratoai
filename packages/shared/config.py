"""Centralised settings using pydantic-settings."""
from __future__ import annotations
from pathlib import Path
from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Force-load .env file BEFORE Settings init, overriding any shell env vars.
# Without override=True, an empty shell ANTHROPIC_API_KEY shadows the .env value.
_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
if _ENV_PATH.exists():
    load_dotenv(_ENV_PATH, override=True)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(_ENV_PATH), extra="ignore")

    # Supabase
    supabase_url: str = Field("", alias="SUPABASE_URL")
    supabase_anon_key: str = Field("", alias="SUPABASE_ANON_KEY")
    supabase_service_key: str = Field("", alias="SUPABASE_SERVICE_KEY")
    database_url: str = Field("", alias="DATABASE_URL")

    # AI
    anthropic_api_key: str = Field("", alias="ANTHROPIC_API_KEY")
    openai_api_key: str = Field("", alias="OPENAI_API_KEY")
    claude_model_heavy: str = Field("claude-sonnet-4-5-20250929", alias="CLAUDE_MODEL_HEAVY")
    claude_model_fast: str = Field("claude-haiku-4-5-20251001", alias="CLAUDE_MODEL_FAST")
    embedding_model: str = Field("text-embedding-3-small", alias="EMBEDDING_MODEL")
    embedding_dimensions: int = Field(1536, alias="EMBEDDING_DIMENSIONS")

    # Scrapers
    scraper_max_pages: int = Field(30, alias="SCRAPER_MAX_PAGES")
    scraper_concurrency: int = Field(4, alias="SCRAPER_CONCURRENCY")
    scraper_delay_seconds: float = Field(1.2, alias="SCRAPER_DELAY_SECONDS")
    scraper_timeout_seconds: float = Field(20.0, alias="SCRAPER_TIMEOUT_SECONDS")

    # Proxies
    proxy_provider: str = Field("", alias="PROXY_PROVIDER")
    proxy_user: str = Field("", alias="PROXY_USER")
    proxy_pass: str = Field("", alias="PROXY_PASS")
    proxy_host: str = Field("", alias="PROXY_HOST")
    proxy_port: int = Field(0, alias="PROXY_PORT")
    proxy_country: str = Field("PA", alias="PROXY_COUNTRY")

    # CAPTCHA
    capsolver_api_key: str = Field("", alias="CAPSOLVER_API_KEY")

    # Orchestration
    prefect_api_url: str = Field("http://localhost:4200/api", alias="PREFECT_API_URL")
    redis_url: str = Field("redis://localhost:6379/0", alias="REDIS_URL")

    # Telemetry
    log_level: str = Field("INFO", alias="LOG_LEVEL")
    sentry_dsn: str = Field("", alias="SENTRY_DSN")

    @property
    def proxy_url(self) -> str | None:
        if not (self.proxy_host and self.proxy_port and self.proxy_user):
            return None
        return f"http://{self.proxy_user}:{self.proxy_pass}@{self.proxy_host}:{self.proxy_port}"


settings = Settings()
