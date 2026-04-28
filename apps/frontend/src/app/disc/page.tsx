import type { Metadata } from "next";
import Link from "next/link";
import {
 ChevronRight,
 Sparkles,
 Compass,
 HelpCircle,
 Lightbulb,
 CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscBars } from "@/components/disc/DiscBars";
import { BrujulaPrioridades } from "@/components/disc/BrujulaPrioridades";
import { ScrollReveal } from "@/components/animation/ScrollReveal";

export const metadata: Metadata = {
 title: "Test DISC explicado simple — Conoce tu superpoder profesional",
 description:
 "¿Qué tipo de profesional eres? Test de 5 minutos. Te decimos en qué brillas y qué evitar.",
};

const TYPES_SIMPLE = [
 {
 letter: "D",
 name: "El Decididor",
 color: "from-blue-400 to-blue-600",
 pill: "bg-blue-50 text-blue-700 border-blue-200",
 one: "El que dirige, decide rápido y no le tiene miedo a tomar riesgos.",
 meeting: 'En una reunión: lleva la agenda y dice "vamos al grano".',
 brilla: "Sales lead · Founder · CEO · Director comercial",
 ojo: "A veces se acelera demasiado y atropella al equipo.",
 },
 {
 letter: "I",
 name: "El Conector",
 color: "from-red-400 to-red-600",
 pill: "bg-red-50 text-red-700 border-red-200",
 one: "El que motiva, conecta personas y vende ideas con entusiasmo.",
 meeting: 'En una reunión: hace reír, propone ideas creativas, mantiene el ánimo.',
 brilla: "Account manager · Marketing · PR · Customer success",
 ojo: "A veces se distrae con detalles y deja cosas a medias.",
 },
 {
 letter: "S",
 name: "El Soporte",
 color: "from-amber-400 to-amber-600",
 pill: "bg-amber-50 text-amber-700 border-amber-200",
 one: "El que cuida al equipo, escucha y mantiene todo funcionando.",
 meeting: 'En una reunión: escucha más que habla, pero todos confían en su opinión.',
 brilla: "Operations · HR · Customer service · Project manager",
 ojo: "A veces le cuesta decir que no y se sobrecarga.",
 },
 {
 letter: "C",
 name: "El Calculador",
 color: "from-emerald-400 to-emerald-600",
 pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
 one: "El que analiza, revisa los detalles y se asegura de que todo esté bien.",
 meeting: 'En una reunión: pregunta "¿esto lo medimos?" y trae datos al chat.',
 brilla: "Engineer · Analyst · Compliance · Auditor · QA",
 ojo: "A veces se traba en analizar y le cuesta decidir.",
 },
];

const FAQ = [
 {
 q: "¿Qué significan las letras D-I-S-C?",
 a: "Son 4 estilos de comportamiento que vienen de un modelo creado en 1928 por William Marston. D = Dominante (el que decide), I = Influyente (el que conecta), S = Estable (el que cuida), C = Concienzudo (el que analiza). No son personalidades — son maneras de actuar en el trabajo.",
 },
 {
 q: "¿Es como un horóscopo o tiene base científica?",
 a: 'No es horóscopo. Lo usan empresas como Banco General, P&G, Adidas y miles más para procesos de selección. Está validado psicométricamente (alfa de Cronbach > 0.75 en español LATAM). Pero no es 100% determinante — es un mapa de tendencias, no un diagnóstico.',
 },
 {
 q: "¿Hay un resultado 'mejor' que otro?",
 a: "No. Cada estilo brilla en roles distintos. Un Decididor (D) sería pésimo como auditor, pero excelente como CEO. Un Calculador (C) sería pésimo como salesperson, pero excelente como engineer. La idea es saber DÓNDE brillas, no si eres 'bueno' o 'malo'.",
 },
 {
 q: "¿Qué es la Brújula de Prioridades?",
 a: 'Es una capa extra encima del DISC. En lugar de 4 dimensiones, son 8 ejes (Acción, Entusiasmo, Colaboración, Apoyo, Equilibrio, Precisión, Desafío, Resultados). Te da un mapa más fino — porque dos personas con el mismo perfil "I" pueden ser muy distintas si una prioriza Colaboración y otra Acción.',
 },
 {
 q: "¿Y si no me identifico con ningún estilo?",
 a: "Es normal. La mayoría somos una combinación. Mónica salió 'Promotor Colaborativo' = alta I + alta D. Tú puedes ser 'Estratega Pragmático' (alta C + alta D) o 'Especialista Confiable' (alta S + alta C). Hay 16 combinaciones reales.",
 },
 {
 q: "¿Tengo que pagar para ver mi resultado?",
 a: 'No. La versión Free te muestra tu DISC completo (las 4 dimensiones). Pro ($9/mes) desbloquea la Brújula de 8 ejes + sugerencias específicas de roles + business cases por industria.',
 },
];

export default function DiscPage() {
 return (
 <>
 <Navbar />
 <main id="main">
 {/* HERO */}
 <section className="relative pt-20 pb-12 overflow-hidden">
 <div className="absolute inset-0 bg-grid-light" aria-hidden />
 <div
 className="absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[700px] rounded-full opacity-50"
 style={{
 background: "radial-gradient(circle, rgba(251,191,36,0.30) 0%, transparent 65%)",
 filter: "blur(60px)",
 }}
 aria-hidden
 />
 <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <Badge variant="gold" className="mb-5">
 <Compass className="size-3" /> Test de personalidad profesional
 </Badge>
 <h1 className="font-display text-5xl md:text-7xl font-bold leading-[0.95] tracking-tighter text-balance max-w-4xl mx-auto">
 <span className="text-slate-900">Descubre</span>{" "}
 <span className="text-gradient-gold">en qué brillas.</span>
 </h1>
 <p className="mt-5 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
 Un test de 5 minutos te dice qué tipo de profesional eres —
 <span className="text-slate-900 font-semibold"> y en qué rol vas a destacar</span>{" "}
 sin matarte.
 </p>
 <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
 <Button asChild size="xl">
 <Link href="/disc/start">
 Hacer mi test gratis
 <ChevronRight className="size-5" />
 </Link>
 </Button>
 <Button asChild size="xl" variant="secondary">
 <Link href="#explicacion">¿Qué es esto?</Link>
 </Button>
 </div>
 <p className="mt-3 text-xs font-mono uppercase tracking-wider text-slate-500">
 5 min · Sin tarjeta · Resultado al instante
 </p>
 </div>
 </section>

 {/* WHAT IS THIS — explainer */}
 <section id="explicacion" className="py-20">
 <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
 <ScrollReveal className="text-center mb-10">
 <Badge variant="default" className="mb-3">
 <HelpCircle className="size-3" /> Sin jerga
 </Badge>
 <h2 className="font-display text-3xl md:text-4xl font-bold text-balance leading-[1.05]">
 <span className="text-slate-900">Te explico simple:</span>{" "}
 <span className="text-gradient-gold">¿qué es esto?</span>
 </h2>
 </ScrollReveal>

 <ScrollReveal delay={0.1}>
 <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 mb-6 shadow-sm">
 <p className="text-lg text-slate-700 leading-relaxed mb-5">
 Hay <strong className="text-slate-900">4 maneras básicas</strong> de
 comportarse en el trabajo. La mayoría tenemos una mezcla, pero{" "}
 <strong className="text-slate-900">una domina más que las otras</strong>.
 </p>
 <p className="text-lg text-slate-700 leading-relaxed mb-5">
 Conocer cuál es la tuya te da{" "}
 <span className="text-gold-700 font-semibold">3 ventajas reales</span>:
 </p>
 <ul className="space-y-3 mb-2">
 <li className="flex items-start gap-3">
 <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-gold-100 text-gold-700 font-mono font-bold text-sm">
 1
 </div>
 <p className="text-slate-700">
 <strong className="text-slate-900">Sabes qué rol te va a hacer feliz</strong> y cuál te va a quemar en 6 meses.
 </p>
 </li>
 <li className="flex items-start gap-3">
 <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-gold-100 text-gold-700 font-mono font-bold text-sm">
 2
 </div>
 <p className="text-slate-700">
 <strong className="text-slate-900">Las empresas filtran mejor</strong> —
 no te llaman para roles donde te vas a aburrir o frustrar.
 </p>
 </li>
 <li className="flex items-start gap-3">
 <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-gold-100 text-gold-700 font-mono font-bold text-sm">
 3
 </div>
 <p className="text-slate-700">
 <strong className="text-slate-900">Negocias mejor</strong> — sabes qué pedir
 en una entrevista (autonomía, equipo, estructura, datos).
 </p>
 </li>
 </ul>
 </div>
 </ScrollReveal>

 <ScrollReveal delay={0.2}>
 <div className="rounded-2xl bg-slate-900 text-white p-6 md:p-8 flex items-start gap-4">
 <Lightbulb className="size-8 text-gold-400 shrink-0" />
 <div>
 <p className="font-display font-bold text-lg mb-1">
 No es horóscopo. Es ciencia aplicada desde 1928.
 </p>
 <p className="text-slate-300 leading-relaxed">
 Lo usan Banco General, P&G, Adidas, Nestlé y miles de empresas para procesos
 de selección. Está validado psicométricamente. No te dice quién eres —
 te dice <strong className="text-white">cómo trabajás mejor</strong>.
 </p>
 </div>
 </div>
 </ScrollReveal>
 </div>
 </section>

 {/* THE 4 TYPES — friendly explainer */}
 <section className="py-20 bg-slate-50/40">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <ScrollReveal className="text-center mb-12">
 <h2 className="font-display text-3xl md:text-5xl font-bold text-balance leading-[1.05]">
 <span className="text-slate-900">Los 4 tipos.</span>{" "}
 <span className="text-gradient-gold">¿Cuál eres tú?</span>
 </h2>
 <p className="mt-3 text-lg text-slate-600 max-w-xl mx-auto">
 Imaginá una reunión de trabajo. ¿Quién eres en esa mesa?
 </p>
 </ScrollReveal>

 <div className="grid md:grid-cols-2 gap-5">
 {TYPES_SIMPLE.map((t, i) => (
 <ScrollReveal key={t.letter} delay={i * 0.06}>
 <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 hover:shadow-md transition-shadow h-full">
 <div className="flex items-start gap-5 mb-5">
 <div
 className={`grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${t.color} text-white font-display font-bold text-4xl shadow-md`}
 >
 {t.letter}
 </div>
 <div className="flex-1 min-w-0">
 <p
 className={`text-xs font-mono uppercase tracking-wider ${t.pill} px-2 py-0.5 rounded-md inline-block mb-2 border`}
 >
 Tipo {t.letter}
 </p>
 <h3 className="font-display text-2xl font-bold text-slate-900 leading-tight">
 {t.name}
 </h3>
 </div>
 </div>

 <p className="text-slate-700 mb-4 text-lg leading-relaxed">{t.one}</p>

 <div className="space-y-3 text-sm">
 <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
 <p className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
 🎯 Imaginalo así
 </p>
 <p className="text-slate-700">{t.meeting}</p>
 </div>

 <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-3">
 <p className="font-bold text-emerald-700 text-xs uppercase tracking-wider mb-1">
 ✓ Brilla en
 </p>
 <p className="text-slate-700">{t.brilla}</p>
 </div>

 <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-3">
 <p className="font-bold text-amber-700 text-xs uppercase tracking-wider mb-1">
 ⚠ Ojo con
 </p>
 <p className="text-slate-700">{t.ojo}</p>
 </div>
 </div>
 </div>
 </ScrollReveal>
 ))}
 </div>
 </div>
 </section>

 {/* SAMPLE RESULT */}
 <section className="py-20">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <ScrollReveal className="text-center mb-12">
 <Badge variant="ai" className="mb-3">
 <Sparkles className="size-3" /> Sample real · Mónica Díaz
 </Badge>
 <h2 className="font-display text-3xl md:text-4xl font-bold leading-[1.05] text-balance">
 <span className="text-slate-900">Así se ve</span>{" "}
 <span className="text-gradient-gold">tu resultado.</span>
 </h2>
 <p className="mt-3 text-slate-600 max-w-xl mx-auto">
 Mónica salió &ldquo;Promotor Colaborativo&rdquo; (alta I + alta D). Por eso brilla
 en ventas y reclutamiento.
 </p>
 </ScrollReveal>

 <div className="grid lg:grid-cols-2 gap-8 items-start">
 <ScrollReveal>
 <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md">
 <div className="flex items-center justify-between mb-5">
 <h3 className="font-display text-xl font-bold text-slate-900">
 Tu DISC
 </h3>
 <Badge variant="default">Free</Badge>
 </div>
 <p className="text-sm text-slate-600 mb-6">
 Las 4 dimensiones básicas. Tu estilo dominante define cómo te perciben los
 empleadores.
 </p>
 <DiscBars />
 </div>
 </ScrollReveal>

 <ScrollReveal delay={0.1}>
 <div className="rounded-3xl border-2 border-gold-300 bg-gradient-to-br from-gold-50 to-amber-50/40 p-8 glow-gold">
 <div className="flex items-center justify-between mb-5">
 <h3 className="font-display text-xl font-bold text-slate-900">
 Tu Brújula
 </h3>
 <Badge variant="gold">Pro</Badge>
 </div>
 <p className="text-sm text-slate-700 mb-6">
 8 ejes de cómo lideras y comunicas. Tu mapa hacia el rol perfecto. Solo en
 plan Pro.
 </p>
 <BrujulaPrioridades />
 </div>
 </ScrollReveal>
 </div>
 </div>
 </section>

 {/* FAQ — preguntas naturales */}
 <section className="py-20 bg-slate-50/40">
 <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
 <ScrollReveal className="text-center mb-10">
 <h2 className="font-display text-3xl md:text-4xl font-bold leading-[1.05] text-balance">
 <span className="text-slate-900">Preguntas que</span>{" "}
 <span className="text-gradient-gold">todos hacen.</span>
 </h2>
 </ScrollReveal>

 <div className="space-y-3">
 {FAQ.map((f, i) => (
 <details
 key={i}
 className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors cursor-pointer"
 >
 <summary className="font-display font-bold text-base text-slate-900 list-none flex items-center justify-between gap-4">
 {f.q}
 <span className="font-mono text-xs text-slate-400 shrink-0 group-open:rotate-180 transition-transform">
 ▼
 </span>
 </summary>
 <p className="mt-3 text-slate-600 leading-relaxed text-[15px]">{f.a}</p>
 </details>
 ))}
 </div>
 </div>
 </section>

 {/* CTA */}
 <section className="py-24">
 <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
 <h2 className="font-display text-4xl md:text-5xl font-bold text-balance leading-[1.05] mb-5">
 <span className="text-slate-900">Te toma 5 minutos.</span>{" "}
 <span className="text-gradient-gold">Te ahorra años en el rol equivocado.</span>
 </h2>
 <p className="text-slate-600 mb-8 text-lg">
 Tu resultado es tuyo. Las empresas solo lo ven si tú aplicas explícitamente.
 </p>
 <Button asChild size="xl">
 <Link href="/disc/start">
 Empezar mi test gratis
 <ChevronRight className="size-5" />
 </Link>
 </Button>
 <p className="mt-3 text-xs text-slate-500 font-mono">
 Sin tarjeta · Sin email obligatorio para empezar
 </p>
 </div>
 </section>
 </main>
 <Footer />
 </>
 );
}
