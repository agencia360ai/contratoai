# Page Override: Leaderboard

> Inherits from MASTER.md.

## Layout

```
┌──────────────────────────────────────────────────────┐
│  Leaderboard                                  [Filter]│
│  Las mejores empresas y reclutadores de Panamá        │
├──────────────────────────────────────────────────────┤
│  [ Empresas ] [ Reclutadores ] [ Industrias ]         │  ← Tabs
├──────────────────────────────────────────────────────┤
│                                                        │
│   👑     #1 Banistmo                  47,892 pts      │
│   ╭───╮  💎 Diamond  ↑3 esta semana                   │
│   │ B │  Banca · 2,450 empleados · Panamá             │
│   ╰───╯  ⚡ Responde en 1.2h promedio                  │
│                                                        │
│   ─────────────────────────────────────────────────   │
│                                                        │
│   2 [logo] Banco General         42,156 pts  💎       │
│   3 [logo] Copa Airlines         38,901 pts  💎       │
│                                                        │
│   ╔═══════════════════════════════╗                   │
│   ║  TU POSICIÓN: #47             ║                   │
│   ║  Tu empresa: Agencia360       ║                   │
│   ║  4,210 pts · 🥇 Gold          ║                   │
│   ║  ▓▓▓▓▓▓▓▓░░░░ 65% al siguiente║                   │
│   ╚═══════════════════════════════╝                   │
│                                                        │
└──────────────────────────────────────────────────────┘
```

## Reglas

1. **Top 3 visualmente diferenciado**: card más grande, gradient, corona/medalla.
2. **Brackets visuales** (Bronze→Legend) con color tier + icono.
3. **Tu posición sticky bottom** (si aplica) — siempre visible mientras navegas.
4. **Filtros**: industria, tamaño empresa, ubicación, periodo (semana/mes/trimestre/año).
5. **Cambio semanal** con flecha (↑5 / ↓2) — verde sube, rojo baja.
6. **Click en card** → perfil público de empresa con métricas detalladas.

## Tabs

- **Empresas** (default)
- **Reclutadores individuales** (top performers humanos)
- **Por industria** (best in class por sector)

## Mobile

Cards stacked. Top 3 con podio visual (3 cards horizontales arriba, listado debajo).

## Métricas visibles en card

- Score total
- Bracket actual + posición exacta
- Tiempo respuesta promedio (proxy de "buen empleador")
- Cambio semanal (↑/↓)
- Ofertas activas
- Industria + tamaño + ubicación

## Acciones

- "Ver perfil" → página detalle empresa
- "Seguir" → notificaciones cuando publican vacantes
- "Comparar con la mía" (solo recruiters logged) → side-by-side
