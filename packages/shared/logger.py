"""Structlog with PII redaction."""
from __future__ import annotations
import logging
import re
import sys
import structlog
from .config import settings

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE_RE = re.compile(r"\b(?:\+?507[\s-]?)?[\d]{4}[\s-]?[\d]{4}\b")
CEDULA_RE = re.compile(r"\b\d{1,2}-\d{3,4}-\d{1,5}\b")


def _redact_processor(_, __, event_dict: dict) -> dict:
    """Strip PII from log records."""
    for k, v in list(event_dict.items()):
        if isinstance(v, str):
            v = EMAIL_RE.sub("[EMAIL]", v)
            v = PHONE_RE.sub("[PHONE]", v)
            v = CEDULA_RE.sub("[CEDULA]", v)
            event_dict[k] = v
    return event_dict


def configure_logging() -> None:
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
    )
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            _redact_processor,
            structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, settings.log_level.upper(), logging.INFO)
        ),
    )


configure_logging()
get_logger = structlog.get_logger
