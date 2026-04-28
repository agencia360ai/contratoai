# TeContrato Panamá 🇵🇦

> Plataforma de empleos con IA + gamificación para Panamá. Scraping de Computrabajo, Encuentra24, Konzerta, MITRADEL, Hiring Room y Workday → matching multidimensional con embeddings y Claude → onboarding conversacional + leaderboards de empresas/reclutadores.

**Stack:** Python 3.12 (uv) · Next.js 15 + Tailwind + shadcn/ui · Supabase (Postgres + pgvector) · Claude Sonnet 4.5 · OpenAI embeddings · Prefect 3 · Hetzner CX22.

---

## TL;DR

```bash
# Once
cp .env.example .env   # rellena tus llaves
make install           # uv sync + playwright + pnpm install
npx supabase start     # arranca DB local
make db-migrate        # corre las 5 migraciones
make db-seed           # ciudades + skills + achievements

# Cada día
make scrape            # corre todos los scrapers
make match             # genera matches para todos los candidatos
make dev               # arranca el frontend en localhost:3000
```

---

## Arquitectura

```
┌──────────────────────────────────────────────────────────────────┐
│  Scrapers (Python)            │  Claude / OpenAI APIs            │
│  ─────────────────            │  ──────────────────              │
│  Computrabajo   ──┐           │  Sonnet 4.5  → enrich + rerank   │
│  Encuentra24    ──┤           │  Haiku 4.5   → skills/level/bens │
│  Konzerta       ──┼─► Supabase │  text-embedding-3-small (1536)   │
│  MITRADEL       ──┤   Postgres │                                  │
│  Hiring Room    ──┤   pgvector ◄─ Matching pipeline (3-stage)    │
│  Workday        ──┘            │                                  │
│                                │                                  │
│  Prefect 3 ─ daily/weekly orchestration                          │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Next.js 15 frontend    │
              │  shadcn/ui + Tailwind   │
              │  ─────────────          │
              │  /                      │ Landing
              │  /onboarding            │ Chat con Pana (5 min)
              │  /jobs · /jobs/[id]     │ Listings + detalle
              │  /matches               │ Tus matches con explicación
              │  /leaderboard           │ Brackets + rankings
              │  /profile               │ Stats + achievements
              │  /recruiter             │ Dashboard reclutador (gamificado)
              └────────────────────────┘
```

## Estructura

```
tecontrato-panama/
├── apps/
│   ├── frontend/          Next.js 15 (App Router, Turbopack)
│   └── api/               FastAPI service (heavy NLP)
├── packages/
│   ├── scrapers/          base + 6 portales
│   ├── ai/                Claude client + embeddings + onboarding
│   ├── pipelines/         matching + company scoring + flows
│   └── shared/            config, schemas, db, logger
├── db/
│   ├── migrations/        0001..0005 (init, pgvector, RLS, match fn, gamification)
│   └── seed/              cities, skills, achievements
├── design-system/
│   ├── MASTER.md          Source of truth de diseño
│   └── pages/             Overrides por pantalla (onboarding, dashboard, leaderboard)
├── infra/                 docker-compose + Dockerfiles
└── docs/
```

## Setup paso a paso

### 1. Prerequisites

- **Python 3.12+**
- **Node 20+** y **pnpm 9+**
- **uv** — `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **Supabase CLI** — `npm i -g supabase`
- **Docker Desktop** (opcional, para Prefect/Redis local)

### 2. Variables de entorno

```bash
cp .env.example .env
```

Rellena:
- `ANTHROPIC_API_KEY` — [console.anthropic.com](https://console.anthropic.com/)
- `OPENAI_API_KEY` — [platform.openai.com](https://platform.openai.com/api-keys)
- `SUPABASE_URL` + `SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_KEY` — automáticos en `supabase start`

### 3. Instalación

```bash
make install
```

Esto corre `uv sync`, instala Chromium para Playwright, e instala deps del frontend con pnpm.

### 4. Base de datos

```bash
make db-start    # Supabase local en :54323 (studio) y :54322 (db)
make db-migrate  # corre db/migrations/*.sql en orden
make db-seed     # ciudades, skills, achievements
```

Para resetear todo: `make db-reset`.

### 5. Pruebas rápidas

```bash
# Scrape solo Computrabajo (~100 jobs)
SUPABASE_URL=... SUPABASE_SERVICE_KEY=... \
  uv run python -m packages.scrapers.computrabajo.scraper

# Verificar
psql $DATABASE_URL -c "select count(*), source from jobs group by source;"

# Frontend
make dev   # → http://localhost:3000
```

### 6. Pipeline completo

```bash
# Una corrida completa: scrape → enrich → embed → match → score companies
uv run python -m packages.pipelines.flows --flow weekly_full
```

### 7. Scheduling con Prefect

```bash
prefect server start &
prefect worker start -p default &
prefect deploy packages/pipelines/flows.py:daily_scrape \
  --name daily \
  --cron "0 3,15 * * *" \
  --timezone America/Panama
```

## Costos estimados (mensual)

| Servicio                   | Plan / volumen                      | USD/mes |
|----------------------------|-------------------------------------|---------|
| Supabase Pro               | 8GB DB, branching                  | **$25** |
| Hetzner CX22 (scrapers)    | 2vCPU/4GB                          | **$4**  |
| Vercel Hobby               | frontend                           | $0      |
| Anthropic Claude           | con caché                          | **$10-18** |
| OpenAI embeddings          | ~1M tokens                         | $1-3    |
| IPRoyal proxies (PAYG)     | ~3GB                                | $5      |
| Capsolver CAPTCHA          | reserva                            | $1      |
| **Total realista**         |                                     | **~$50** |

## Sistema de gamificación

### Para candidatos
- **XP** por completar perfil, aplicar, validar habilidades, mantener streak.
- **Niveles** 1–6 con barras de progreso y celebración (confetti).
- **Achievements**: 13 badges desde "Primer paso" hasta "Leyenda de la racha".
- **Brackets** Bronze → Silver → Gold → Platinum → Diamond → Legend.

### Para reclutadores / empresas
- **Recruiter Score** = tiempo respuesta + ratio entrevista/oferta + reviews + diversidad + transparencia salarial + feedback a rechazados.
- **Company brackets** públicos. Las empresas que tratan mal a candidatos quedan en Bronze visiblemente.
- **Leaderboards** por industria, por tamaño, por ubicación, semanales y mensuales.
- **Quests** diarias y semanales: "Responde a 5 candidatos hoy", "Publica 2 vacantes con salario".

Esto crea presión de mercado sana: mejorar UX del candidato sube tu bracket, lo cual sale en tu sitio web (widget embebible en el roadmap).

## Aspectos legales (Ley 81 de Panamá)

El proyecto está diseñado para uso académico bajo la **excepción científica** de la Ley 81 (Art. 8) + **interés legítimo**, con:

- Anonimización efectiva en logs (PII redaction en `packages/shared/logger.py`).
- Consent flow explícito en onboarding (paso 1).
- RLS estricto: cada candidato solo ve sus datos.
- No scraping logged-in. Solo datos públicos.
- Retención corta + DPIA documentada en `docs/legal/`.

Ver `docs/legal/ley-81-compliance.md` (TODO).

## Roadmap (90 días)

- **Sprint 1 (sem 1-2)**: scrapers Computrabajo + Hiring Room + DB ✅ Done
- **Sprint 2 (sem 3-4)**: scrapers restantes + dedup + enrichment ⏳
- **Sprint 3 (sem 5-6)**: onboarding chat con Claude real + perfil estandarizado
- **Sprint 4 (sem 7-8)**: matching multidimensional + reranker
- **Sprint 5 (sem 9-10)**: gamification UI completa + leaderboards live
- **Sprint 6 (sem 11-12)**: pulido + métricas + tesis

## Comandos útiles

```bash
make help            # lista todo
make install         # uv + playwright + pnpm
make dev             # frontend
make db-start        # supabase local
make db-migrate      # apply migrations
make db-seed         # seed reference data
make db-reset        # nuke + redo
make scrape          # daily scrape flow
make match           # full matching for all candidates
make test            # pytest + jest
make lint            # ruff + biome
```

## License

MIT (académico).
