# TeContrato Panamá Pro — Design System (v2 · Black Mirror Edition)

> Premium B2B AI recruitment platform. Dark-mode-first, futuristic, AI-forward.
> Source of truth for all UI/UX. Page overrides live in `design-system/pages/`.

## 1. Filosofía

**Nuevo principio rector:** *"Vendemos velocidad y precisión. La interfaz tiene que SENTIRSE como el futuro de la contratación."*

Audiencia primaria (B2B):
- Heads of Talent / Recruiters de empresas medianas/grandes
- Empresas que están cansadas del proceso de 45 días
- Reclutadores boutique como Mónica Díaz manejando 12+ vacantes

Audiencia secundaria (candidatos):
- Profesionales senior y ejecutivos (>$2,000 mensual)
- Tech/banca/aviación/retail de lujo
- Buscan empresas serias, transparentes, con feedback real

Cada decisión optimiza por:
1. **Sentir tecnología avanzada** sin parecer juguete
2. **Confianza enterprise** — somos serios, no startup ruidosa
3. **Velocidad visual** — todo carga rápido, transiciones cortas
4. **AI-forward** — la IA es el héroe, no escondida
5. **Premium** — gold accents, dark mode, micro-glows

## 2. Style: Premium Dark + AI Accents

**Base:** Dark mode primario (modo claro disponible pero secundario).
**Inspiración:** Linear, Vercel dashboard, Apple developer site, OpenAI Platform, Stripe Atlas.

**Toques permitidos:**
- Subtle grid pattern de fondo (opacity 0.06)
- Radial gradient glows en CTAs y headers (gold/violet, low intensity)
- Glassmorphism en cards: `bg-white/5 backdrop-blur-xl border-white/10`
- Animated gradient blobs en hero (low opacity, slow motion)
- Borders sutiles con glow gold en hover
- Animated borders en cards premium (conic gradient rotation)
- Tipografía con tracking apretado (-0.02em) en headings

**Anti-patterns (PROHIBIDOS):**
- Cyberpunk loud (matrix green, glitch effects fuertes)
- Vaporwave pink-cyan
- Drop shadows pesadas
- Skeuomorfismo
- Botones redondeados 9999px en CTAs (usamos rounded-xl)
- Emojis como icons UI (Lucide everywhere)
- Purple/pink AI gradients mainstream — usamos GOLD como diferenciador

## 3. Color tokens (dark-first)

```css
/* Backgrounds */
--bg-primary:    #0A0A0F;  /* page bg, casi negro */
--bg-elevated:   #11121A;  /* cards default */
--bg-overlay:    #1A1B26;  /* modals, popovers */
--bg-subtle:     rgba(255,255,255,0.02);

/* Borders */
--border-subtle: rgba(255,255,255,0.06);
--border-default: rgba(255,255,255,0.10);
--border-strong: rgba(255,255,255,0.18);
--border-glow-gold:  rgba(202,138,4,0.4);
--border-glow-violet: rgba(139,92,246,0.4);

/* Text */
--text-primary:  #FAFAFA;  /* headings */
--text-default:  #E4E4E7;  /* body */
--text-muted:    #A1A1AA;  /* secondary */
--text-subtle:   #71717A;  /* hints */

/* Brand — premium gold (replaces orange CTA) */
--gold-50:  #FFFBEB;
--gold-100: #FEF3C7;
--gold-300: #FCD34D;
--gold-400: #FBBF24;
--gold-500: #F59E0B;
--gold-600: #D97706;
--gold-700: #B45309;

/* Indigo retained for secondary actions (less prominent now) */
--indigo-400: #818CF8;
--indigo-500: #6366F1;
--indigo-600: #4F46E5;

/* Status */
--success: #10B981;
--warning: #F59E0B;
--error:   #EF4444;
--info:    #06B6D4;

/* Bracket tiers — keep visual identity */
--bracket-bronze:   #B45309;
--bracket-silver:   #94A3B8;
--bracket-gold:     #F59E0B;
--bracket-platinum: #818CF8;
--bracket-diamond:  #06B6D4;
--bracket-legend:   #C026D3;

/* Best Place to Work badge */
--bptw-glow: 0 0 20px rgba(251,191,36,0.5), 0 0 40px rgba(251,191,36,0.3);
```

**Reglas:**
- 95% del UI es neutro (zinc/black/white). Color reservado para CTAs principales y estado.
- **Gold** es nuestro diferenciador — solo CTAs primarios, badges premium, hovers en cards top.
- **Indigo** queda para tier secundario/info.
- **Verde** = match score alto, success.
- **Cyan** = data, AI features ("powered by AI" indicators).
- Gradientes ok pero suaves: `from-amber-400/80 via-orange-500/70 to-red-600/60` para hero accent.

## 4. Typography

**Plus Jakarta Sans** (manteniendo) + **JetBrains Mono** para data/code/numbers.

```css
fontFamily: {
  sans: ['Plus Jakarta Sans', ...],
  display: ['Plus Jakarta Sans', ...],
  mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
}
```

**Display headings (hero, big stats):**
- Weight: 700-800
- Tracking: -0.04em (apretado)
- Size scale: 4xl (mobile) → 6xl (desktop) → 8xl (hero only)
- Use `bg-gradient-to-br from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent` para premium feel

**Body:**
- 16-18px
- Weight 400
- Tracking 0
- Line-height 1.6
- Color: `text-zinc-300` en dark, `text-zinc-700` en light

**Mono usage:**
- Métricas en dashboards (KPIs, percentages)
- Códigos (job IDs, bracket tier counters)
- "Powered by AI" badges

## 5. Componentes core

### Button
```
primary:      bg-gradient-to-b from-amber-400 to-amber-600 text-zinc-900 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]
secondary:    bg-white/5 border border-white/10 text-zinc-100 hover:bg-white/10
outline:      border border-amber-500/40 text-amber-300 hover:bg-amber-500/10
ghost:        text-zinc-400 hover:text-zinc-100 hover:bg-white/5
```

### Card
- `bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl p-6`
- Hover: `border-white/20` + soft glow `shadow-[0_0_30px_rgba(255,255,255,0.04)]`
- Premium card: `border-amber-500/30` + gold glow

### Input
- `bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20`

### Badge
- Default: `bg-white/5 border border-white/10 text-zinc-300`
- Gold/Premium: `bg-amber-500/10 border border-amber-500/30 text-amber-300`
- AI: `bg-cyan-500/10 border border-cyan-500/30 text-cyan-300`
- BPTW: animated border, gold glow shadow

## 6. Layouts

### Hero pattern
```
[grid background, opacity 0.06]
[radial glow center-top, gold/violet, blur 100px]
                ▼
        [eyebrow chip] (ej: "AI · Panamá")
        [Title huge] (8xl, gradient text)
        [Subtitle muted]
        [Primary CTA] [Secondary CTA]
        [Trust strip] (logos faded)
```

### Card grid (pricing, features)
- 3 cols desktop, 1 col mobile
- Featured plan elevated: `scale-105` + glow border + "Most popular" badge

### Dashboard pattern (recruiter, jobs)
- Sidebar fija izquierda (240px) con accent line gold en active
- Main content max-w-7xl
- Top bar con search + user menu
- KPI cards en grid 4 cols con mono numbers
- Tablas con `divide-white/5` y hover sutil

## 7. Motion

- **Page transitions:** 200ms fade + 4px translateY
- **Hover:** 200ms color, no scale (causa layout shift)
- **Glow appearance:** 400ms cubic-bezier(0.4,0,0.2,1)
- **Hero blobs:** 8s slow drift animation
- **Marquee company logos:** 30s linear infinite
- **Number counters:** 1s ease-out (stagger)
- **Reduced motion:** disable all blobs/marquees, keep only opacity transitions

## 8. Iconography

**Lucide React** primarily. JetBrains Mono for stat numbers.

Sizes:
- 16px (inline): `size-4`
- 20px (button): `size-5`
- 24px (section header): `size-6`
- 32px (hero accent): `size-8`

**No emojis ever** as UI icons.

## 9. Tone of voice (B2B premium)

- **Headlines:** afirmaciones cortas, presentes. "Contrata en 3 días, no en 45."
- **Subheads:** datos concretos. "1,200+ candidatos pre-filtrados. 0% currículums basura."
- **CTAs:** verbos directos. "Ver demo", "Empezar gratis", "Hablar con ventas".
- **No hype:** evitamos "revolutionary", "game-changer". Sí: "más rápido", "mejor", "menos tiempo".
- **Bilingüe:** ES default. EN para clientes multinacionales (toggle en footer).

## 10. Componentes de marca específicos

### "Best Place to Work" badge
Animated conic-gradient border + gold glow. Indica empresas verificadas/premium.

### "AI-powered" tag
Pequeño chip cyan con icon Sparkles, indica features con IA.

### "3 días" speed promise visual
Hero featured timer/countdown style mostrando diferencia con mercado (45d → 3d).

### DISC Visualizer
Cuadrado dividido en 4 con colores: D=red, I=yellow, S=green, C=blue. Marcador del usuario con glow.

### Match Score Ring
Mantenemos el ring SVG. Color por score: <60 zinc, 60-80 amber, >80 emerald glow.

### Bracket Badge
Mantenemos brackets bronze→legend con icon Lucide. Gold tier = animated border.

## 11. Accessibility (no negociable)

- Contraste mínimo 7:1 en text-primary (mejor que 4.5 estándar) por dark mode con neon
- Focus visible: amber ring 2px offset
- aria-labels en icon-only buttons
- prefers-reduced-motion deshabilita blobs, marquees, glows pulsantes
- Keyboard navigation completa
- Semantic HTML siempre

## 12. Pre-delivery checklist

- [ ] Dark mode primary, light mode opcional
- [ ] Sin emojis como icons (Lucide everywhere)
- [ ] cursor-pointer en clickable
- [ ] Hover transitions 150-300ms, sin layout shift
- [ ] Contraste 7:1 en dark mode (porque tenemos accents neón)
- [ ] Focus visible amber ring
- [ ] Responsive 375 / 768 / 1024 / 1440
- [ ] No horizontal scroll mobile
- [ ] Touch targets ≥44px
- [ ] Loading skeletons + empty states
- [ ] prefers-reduced-motion respeta
- [ ] Mobile-first probado en 375px iPhone SE
