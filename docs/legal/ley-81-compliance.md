# Ley 81 de Panamá — Compliance checklist

> Última revisión: 2026-04-27. Validar trimestralmente con asesoría legal antes de transición a uso comercial.

## Marco legal aplicable

- **Ley 81 del 26 de marzo de 2019** — Protección de Datos Personales.
- **Decreto Ejecutivo 285 de 2021** — Reglamento.
- **Autoridad reguladora:** ANTAI.
- **Sanciones:** B/. 1,000 — B/. 10,000 + posible clausura.

## Bases de licitud invocadas

1. **Consentimiento explícito** del titular (Art. 6) — pedido en onboarding paso 1.
2. **Interés legítimo** del responsable (Art. 8.6) — para procesamiento de datos públicos de portales.
3. **Excepción científica** (Art. 8 párrafo final) — para uso académico, condicionada a anonimización efectiva.

## Datos sensibles (Art. 5/13)

❌ NO recolectamos: religión, salud, política, orientación, etnia, biométricos.
✅ Sí recolectamos: nombre, edad rango, ubicación, experiencia, skills, preferencias salariales.

## Implementación técnica

| Riesgo | Mitigación | Ubicación en el código |
|--------|-----------|------------------------|
| PII en logs | Redactor structlog | `packages/shared/logger.py` |
| Acceso cruzado | RLS Supabase | `db/migrations/0003_rls_policies.sql` |
| Datos personales en scraped HTML | Limit raw_html 200KB + delete on demand | `packages/scrapers/base/base_scraper.py` |
| Falta consent | Step 1 onboarding obligatorio | `apps/frontend/src/components/onboarding/ChatOnboarding.tsx` |
| Datos no anonimizados en datasets académicos | Hash de email/cédula/nombre + k-anonimato | `packages/shared/schemas.py` (full_name_hash, email_hash) |

## Derechos ARCOP (Acceso, Rectificación, Cancelación, Oposición, Portabilidad)

A implementar:
- `/profile/data-export` — descarga JSON con todos los datos del usuario (Portabilidad).
- `/profile/delete` — borrado completo en 10 días (Cancelación).
- `/profile/settings` — toggles ON/OFF para cada uso (Oposición).
- Email a `privacidad@tecontrato.pa` (Acceso, Rectificación).

## Checklist académica (mientras es uso académico)

- [x] Solo scraping logged-off, sin crear cuentas falsas
- [x] User-agent identificable con email académico (ajustar antes de correr)
- [x] Rate limiting ≤1 req/seg + Crawl-Delay respetado
- [x] No publicación de scrapes crudos (solo agregados N>50)
- [ ] Carta de aval institucional (firmar y guardar en `docs/legal/`)
- [ ] DPIA si N > 5,000 perfiles personales
- [ ] Consent banner en frontend visible
- [ ] Política de privacidad publicada en `/privacidad`

## Transición a comercial

Cuando el proyecto deje de ser académico:
1. Re-pedir consentimiento explícito para uso comercial.
2. Contratos B2B con empresas reclutadoras (interés legítimo formal).
3. DPO designado y registrado en ANTAI.
4. Auditoría externa de la BD anonimizada.
