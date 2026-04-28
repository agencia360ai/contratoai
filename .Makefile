.PHONY: help install dev db-start db-migrate db-seed db-reset scrape match test lint format clean

help:
	@echo "TeContrato Panamá — Make commands"
	@echo ""
	@echo "  install        Install Python + Node deps"
	@echo "  dev            Start frontend dev server"
	@echo "  db-start       Start Supabase local"
	@echo "  db-migrate     Run all migrations"
	@echo "  db-seed        Seed reference data"
	@echo "  db-reset       Reset DB + re-run migrations + seed"
	@echo "  scrape         Run all scrapers once"
	@echo "  match          Run matching for all candidates"
	@echo "  test           Run pytest + jest"
	@echo "  lint           ruff + biome"
	@echo "  format         ruff format + biome format"

install:
	uv sync
	uv run playwright install chromium
	pnpm install

dev:
	pnpm dev

db-start:
	npx supabase start

db-stop:
	npx supabase stop

db-migrate:
	@for f in db/migrations/*.sql; do \
		echo ">> $$f"; \
		psql $$DATABASE_URL -f "$$f" || exit 1; \
	done

db-seed:
	@for f in db/seed/*.sql; do \
		echo ">> $$f"; \
		psql $$DATABASE_URL -f "$$f" || exit 1; \
	done

db-reset: db-stop db-start db-migrate db-seed

scrape:
	uv run python -m packages.pipelines.flows --flow daily_scrape

match:
	uv run python -m packages.pipelines.flows --flow match_all

test:
	uv run pytest -xvs
	pnpm --filter frontend test --run

lint:
	uv run ruff check .
	pnpm --filter frontend lint

format:
	uv run ruff format .
	uv run ruff check --fix .

clean:
	rm -rf .venv node_modules apps/frontend/.next
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
