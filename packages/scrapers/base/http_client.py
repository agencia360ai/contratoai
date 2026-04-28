"""Layered HTTP client.

Layer 1 (httpx async + http2)               90% of requests
Layer 2 (curl_cffi impersonate=chrome124)    5% — TLS fingerprint bypass
Layer 3 (rebrowser-playwright)               5% — last resort, full browser
"""
from __future__ import annotations
import asyncio
import random
from typing import Any
import httpx
from packages.shared.config import settings
from packages.shared.logger import get_logger

logger = get_logger(__name__)

UA_POOL = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
]


def random_ua() -> str:
    return random.choice(UA_POOL)


class LayeredHttpClient:
    """Concurrency-bounded multi-layer fetcher."""

    def __init__(
        self,
        concurrency: int | None = None,
        timeout: float | None = None,
        proxy: str | None = None,
    ) -> None:
        self.semaphore = asyncio.Semaphore(concurrency or settings.scraper_concurrency)
        self.timeout = timeout or settings.scraper_timeout_seconds
        self.proxy = proxy or settings.proxy_url
        self._httpx: httpx.AsyncClient | None = None

    async def __aenter__(self) -> "LayeredHttpClient":
        self._httpx = httpx.AsyncClient(
            timeout=self.timeout,
            http2=True,
            follow_redirects=True,
            headers={"User-Agent": random_ua(), "Accept-Language": "es-PA,es;q=0.9,en;q=0.5"},
            proxy=self.proxy,
        )
        return self

    async def __aexit__(self, *_: Any) -> None:
        if self._httpx:
            await self._httpx.aclose()

    # ---- Layer 1 ----
    async def _fetch_httpx(self, url: str) -> str | None:
        assert self._httpx is not None
        try:
            r = await self._httpx.get(url)
            if r.status_code == 200 and len(r.text) > 800:
                return r.text
            logger.debug("httpx_low_quality", url=url, status=r.status_code, bytes=len(r.text))
        except Exception as e:
            logger.debug("httpx_fail", url=url, error=str(e))
        return None

    # ---- Layer 2 ----
    async def _fetch_curl_cffi(self, url: str) -> str | None:
        try:
            from curl_cffi import requests as cffi_req  # type: ignore
        except ImportError:
            logger.warning("curl_cffi_not_installed")
            return None
        try:
            loop = asyncio.get_event_loop()
            r = await loop.run_in_executor(
                None,
                lambda: cffi_req.get(
                    url,
                    impersonate="chrome124",
                    timeout=self.timeout,
                    proxies={"http": self.proxy, "https": self.proxy} if self.proxy else None,
                ),
            )
            if r.status_code == 200 and len(r.text) > 800:
                return r.text
            logger.debug("curl_cffi_low_quality", url=url, status=r.status_code)
        except Exception as e:
            logger.debug("curl_cffi_fail", url=url, error=str(e))
        return None

    # ---- Layer 3 ----
    async def _fetch_playwright(self, url: str) -> str | None:
        try:
            try:
                from rebrowser_playwright.async_api import async_playwright  # type: ignore
            except ImportError:
                from playwright.async_api import async_playwright  # type: ignore
        except ImportError:
            logger.warning("playwright_not_installed")
            return None

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(
                    headless=True,
                    args=[
                        "--disable-blink-features=AutomationControlled",
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                    ],
                    proxy={"server": self.proxy} if self.proxy else None,
                )
                ctx = await browser.new_context(
                    user_agent=random_ua(),
                    locale="es-PA",
                    timezone_id="America/Panama",
                )
                page = await ctx.new_page()
                await page.goto(url, wait_until="domcontentloaded", timeout=30_000)
                # Slight wait for JS-rendered content
                await page.wait_for_timeout(1500)
                html = await page.content()
                await browser.close()
                if len(html) > 800:
                    return html
        except Exception as e:
            logger.warning("playwright_fail", url=url, error=str(e))
        return None

    async def fetch(self, url: str) -> str | None:
        """Try layers in sequence; return HTML or None."""
        async with self.semaphore:
            html = await self._fetch_httpx(url)
            if html:
                return html
            logger.info("fallback_curl_cffi", url=url)
            html = await self._fetch_curl_cffi(url)
            if html:
                return html
            logger.info("fallback_playwright", url=url)
            return await self._fetch_playwright(url)

    async def fetch_json(self, url: str, **kwargs: Any) -> dict | list | None:
        """JSON GET via httpx only (most APIs don't need browser fallback)."""
        assert self._httpx is not None
        try:
            r = await self._httpx.get(url, **kwargs)
            if r.status_code == 200:
                return r.json()
            logger.debug("json_fetch_status", url=url, status=r.status_code)
        except Exception as e:
            logger.debug("json_fetch_fail", url=url, error=str(e))
        return None

    async def post_json(self, url: str, json_body: dict, **kwargs: Any) -> dict | list | None:
        assert self._httpx is not None
        try:
            r = await self._httpx.post(url, json=json_body, **kwargs)
            if r.status_code in (200, 201):
                return r.json()
            logger.debug("post_json_status", url=url, status=r.status_code)
        except Exception as e:
            logger.debug("post_json_fail", url=url, error=str(e))
        return None
