# Page Override: Candidate Dashboard

> Inherits from MASTER.md. Focus: motivar al usuario a volver cada día.

## Layout (mobile-first)

```
┌────────────────────────────────────────┐
│  ¡Buenas, Joann! 👋                    │
│  Llevas 5 días seguidos · 🔥 racha     │
├────────────────────────────────────────┤
│  ┌─ NIVEL ──────────────────────────┐ │
│  │  🥇 Profesional · Nivel 4        │ │
│  │  ▓▓▓▓▓▓▓▓░░░░░░ 2,450 / 4,000 XP │ │
│  │  Faltan 1,550 XP para Senior     │ │
│  └──────────────────────────────────┘ │
├────────────────────────────────────────┤
│  PRÓXIMO PASO                          │
│  ┌──────────────────────────────────┐ │
│  │ ⚡ Completa tu test de Excel     │ │
│  │   +50 XP al terminar              │ │
│  │              [ Empezar (1 min) ] │ │
│  └──────────────────────────────────┘ │
├────────────────────────────────────────┤
│  TUS MATCHES (3 nuevos)                │
│  ─────────────────────────────────     │
│  ┃ 🟢 95% Match                        │
│  ┃ Senior Frontend · Banco General     │
│  ┃ $2,800–3,500 · Hybrid · San Fco     │
│  ┃ "Tu experiencia en React + tu       │
│  ┃  perfil de C-alto encajan perfecto" │
│  ┃           [ Ver detalle ] [ ❤ ]    │
│                                          │
├────────────────────────────────────────┤
│  DESAFÍO DEL DÍA                       │
│  Aplica a 1 trabajo hoy → +20 XP       │
└────────────────────────────────────────┘
```

## Componentes específicos

### LevelBar
- Progress horizontal con gradient.
- Color del bracket actual.
- Texto "X / Y XP" + "Faltan Z para [Next Tier]".
- Click → modal con todos los niveles + cómo conseguir XP.

### NextStepCard
- Acción única, recomendada por IA.
- Tiempo estimado visible ("1 min").
- XP que dará al completar.
- CTA grande naranja.

### MatchCard
- Score circular grande arriba (color = verde si >0.8, amarillo 0.6-0.8, gris <0.6).
- Título trabajo + empresa logo.
- Salario rango visible (transparencia).
- 2 lines explanation IA.
- Acciones: Ver, Like, Aplicar inmediato.

### DailyChallenge
- Reset cada 24h.
- Si completado: confetti + XP animation.
- Streak counter visible.

## Empty states

Si no hay matches: ilustración de Pana señalando + "Aún estoy buscando los mejores trabajos para ti. Mientras tanto, ¿completas tu perfil al 100%?"

## Realtime

- Nuevo match → toast notification "¡Match nuevo!" + sonido suave (opcional).
- XP earned → +X flotante animado encima del LevelBar.

## Streak

- Indicador 🔥 con número de días consecutivos.
- Si pierde streak: mensaje empático "Volviste 💪 Empecemos racha nueva".
- Hitos: 7 días = badge, 30 días = badge dorado, 100 días = leyenda.
