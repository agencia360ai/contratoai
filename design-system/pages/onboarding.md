# Page Override: Onboarding (Conversational Chat)

> Inherits from MASTER.md. Overrides below.

## Pattern

**Chat-style interface** (no formularios). UI clone de Telegram/WhatsApp pero más limpio.

```
┌────────────────────────────────────────┐
│  [PanaAvatar]  Pana                    │  ← top header sticky
│                en línea                 │
├────────────────────────────────────────┤
│                                          │
│  [Pana]  ¡Buenas! Soy Pana, tu asistente│
│          ¿Cómo te llamas?                │
│                                          │
│                          Joann [Tú] ──┐ │
│                                       │ │
│  [Pana]  ¡Mucho gusto, Joann! 🎉      │ │
│          ¿Cuántos años tienes?         │ │
│                                          │
│  [○ 18-25] [○ 26-35] [○ 36-45] ...    │  ← chips de respuesta
│                                          │
├────────────────────────────────────────┤
│  ▓▓▓▓▓▓▓░░░░░░░░░  35% (paso 5/14)    │  ← progress bottom
└────────────────────────────────────────┘
```

## Reglas específicas

1. **Una pregunta a la vez.** Nunca dos preguntas en un mensaje.
2. **Respuestas con chips** cuando hay opciones limitadas (en lugar de dropdown).
3. **Free text** solo cuando es necesario (nombre, aspiraciones).
4. **Bubble del usuario** alineado derecha, color indigo `bg-primary-600 text-white`.
5. **Bubble de Pana** alineado izquierda, color slate `bg-slate-100 text-slate-900`.
6. **Avatar Pana** circular 32px en cada burbuja del bot.
7. **Typing indicator** entre mensajes (3 dots animados, 800ms delay).
8. **Audio voice-note option** para usuarios con baja literacy → speech-to-text con Whisper.

## Progress

Bottom bar fijo con porcentaje y "paso X de Y". El total es ~14 preguntas en MVP.

## Microcopy clave

- Welcome: "¡Buenas! Soy **Pana**, tu asistente. En 5 minutos te conecto con trabajos hechos para ti. ¿Empezamos?"
- Pregunta sensible (salario): "Tranquilo, esto solo lo ven empresas si tú aceptas. ¿Cuánto te gustaría ganar al mes?"
- Test de skill: "Quiero ver tu **superpoder** real. Te hago una pregunta rápida sobre Excel..."
- Cierre: "¡Listo, Joann! 🎉 Te encontré **23 vacantes que matchean contigo**. ¡Vamos a verlas!"

## Animaciones

- Cada mensaje del bot aparece con `slide-in-from-left` 200ms.
- Cuando completa una sección: confetti suave (10 partículas) + "+50 XP" notificación.
- Progress bar anima `width` cada cambio.

## Mobile-first

Esta vista es 100% pensada en mobile. En desktop, la conversación va centrada `max-w-md` con un panel lateral derecho mostrando preview del perfil que se está armando.
