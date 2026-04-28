import type { Metadata } from "next";
import Link from "next/link";
import {
 ChevronRight,
 Zap,
 Bell,
 TrendingUp,
 Target,
 Mic,
 Sparkles,
 CheckCircle2,
 Users2,
 Brain,
 DollarSign,
 ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/animation/ScrollReveal";

export const metadata: Metadata = {
 title: "Para candidatos — Postula mientras duermes",
 description:
 "Auto-Apply, alertas WhatsApp, CV Coach, salary insights. La plataforma trabaja por ti.",
};

export default function CandidatosPage() {
 return (
 <>
 <Navbar />
 <main id="main">
 {/* HERO */}
 <section className="relative pt-24 pb-16 overflow-hidden">
 <div className="absolute inset-0 bg-grid-light" aria-hidden />
 <div
 className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full opacity-50"
 style={{
 background: "radial-gradient(circle, rgba(251,191,36,0.30) 0%, transparent 65%)",
 filter: "blur(60px)",
 }}
 aria-hidden
 />

 <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <Badge variant="gold" className="mb-6">
 <Users2 className="size-3" /> Para candidatos
 </Badge>

 <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tighter text-balance max-w-5xl mx-auto">
 <span className="text-slate-900">Aplica a vacantes</span>{" "}
 <span className="text-gradient-gold">sin esfuerzo.</span>
 </h1>

 <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
 Sube tu CV una vez. La plataforma aplica por ti a las vacantes que coinciden con tu perfil.{" "}
 <span className="text-slate-900 font-semibold">24/7.</span>
 </p>

 <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
 <Button asChild size="xl">
 <Link href="/onboarding">
 Crear mi perfil — gratis
 <ChevronRight className="size-5" />
 </Link>
 </Button>
 <Button asChild size="xl" variant="secondary">
 <Link href="/jobs">Ver vacantes</Link>
 </Button>
 </div>

 <p className="mt-6 text-xs font-mono uppercase tracking-wider text-slate-500">
 Plan Free para siempre · Sin tarjeta · Sin compromiso
 </p>

 {/* Free version banner */}
 <div className="mt-10 max-w-3xl mx-auto rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-5 flex items-start gap-4 text-left">
 <div className="grid size-12 place-items-center rounded-xl bg-emerald-500 text-white shrink-0">
 <CheckCircle2 className="size-6" />
 </div>
 <div className="flex-1">
 <p className="font-bold text-slate-900 mb-1">
 100% gratis para empezar
 </p>
 <p className="text-sm text-slate-700 leading-relaxed">
 Sube tu CV, completa tu perfil, busca y aplica manualmente a las{" "}
 <strong>1,010+ vacantes</strong> que tenemos. Sin pagar nada. Para siempre.
 </p>
 </div>
 </div>
 </div>
 </section>

 {/* THE 7 SUPERPOWERS */}
 <section className="py-24 bg-slate-50/40">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <ScrollReveal className="text-center mb-14">
 <h2 className="font-display text-4xl md:text-5xl font-bold text-balance leading-[1.05]">
 <span className="text-slate-900">7 superpoderes</span>{" "}
 <span className="text-gradient-gold">en Pro.</span>
 </h2>
 <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
 Lo que recibes cuando pagas $9 al mes. Cancelas cuando quieras.
 </p>
 </ScrollReveal>

 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
 <SuperPower
 icon={Zap}
 num="01"
 title="Auto-Apply 24/7"
 desc="Tu perfil postula automáticamente a todas las vacantes que matchean. Aplicas a 50+ por semana sin levantar un dedo."
 hero
 />
 <SuperPower
 icon={TrendingUp}
 num="02"
 title="CV Coach semanal"
 desc='"Tu CV scoreó 73/100 esta semana. +5 puntos si agregás tu LinkedIn." Mejoras cada lunes.'
 />
 <SuperPower
 icon={Mic}
 num="03"
 title="AI Voice Practice"
 desc="Practica entrevistas con voz natural, recibe feedback de tono, contenido y método CAR (P&G style)."
 />
 <SuperPower
 icon={Brain}
 num="04"
 title="DISC + Brújula completos"
 desc="Los 16 arquetipos, los 8 ejes, sugerencias de roles específicos donde brillas."
 />
 <SuperPower
 icon={Bell}
 num="05"
 title="Alertas WhatsApp en vivo"
 desc="Match >85% que aparece a las 11pm? Te avisamos. Antes que la vacante cierre."
 />
 <SuperPower
 icon={Target}
 num="06"
 title="Priority shortlist"
 desc="Cuando empresas filtran candidatos, tu perfil sale primero en la cola. +3× visibilidad."
 />
 <SuperPower
 icon={DollarSign}
 num="07"
 title="Salary insights"
 desc="Rangos reales por rol/industria/empresa. Sabes cuánto pedir antes de la entrevista."
 />
 </div>

 <ScrollReveal>
 <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 max-w-2xl mx-auto flex items-center gap-4">
 <div className="grid size-10 place-items-center rounded-xl bg-emerald-500 text-white shrink-0">
 <ShieldCheck className="size-5" />
 </div>
 <div>
 <p className="font-bold text-slate-900">Plan Solidario · 100% gratis</p>
 <p className="text-sm text-slate-700">
 Si tu salario actual o aspirado es menor a $1,000 USD, Pro es gratis mientras
 buscas. Verificación rápida con Cédula.
 </p>
 </div>
 </div>
 </ScrollReveal>
 </div>
 </section>

 {/* STATS */}
 <section className="py-16">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <ScrollReveal>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <StatBlock big="50+" label="Aplicaciones automáticas" detail="por semana" />
 <StatBlock big="3×" label="Más visibilidad" detail="vs perfil Free" />
 <StatBlock big="14" label="Días promedio" detail="hasta primera entrevista" />
 <StatBlock big="$9" label="Por mes" detail="cancelas cuando quieras" gold />
 </div>
 </ScrollReveal>
 </div>
 </section>

 {/* HOW IT WORKS */}
 <section className="py-24 bg-slate-50/40">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <ScrollReveal className="text-center mb-14">
 <h2 className="font-display text-4xl md:text-5xl font-bold text-balance leading-[1.05]">
 <span className="text-slate-900">3 pasos.</span>{" "}
 <span className="text-gradient-gold">Empiezas hoy.</span>
 </h2>
 </ScrollReveal>

 <div className="grid md:grid-cols-3 gap-5">
 <StepCard
 num="01"
 title="Subes tu CV"
 detail="PDF, scan, foto. Lo procesamos automáticamente y armamos tu perfil estandarizado."
 caption="3 segundos"
 />
 <StepCard
 num="02"
 title="Hacés DISC + Brújula"
 detail="Test de 5 minutos contextualizado por industria. Tu perfil queda completo."
 caption="5 minutos"
 highlight
 />
 <StepCard
 num="03"
 title="Auto-Apply empieza"
 detail="A partir del minuto siguiente postulamos a vacantes que matchean. Tú seguís tu vida."
 caption="Para siempre"
 />
 </div>
 </div>
 </section>

 {/* CTA */}
 <section className="py-24">
 <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
 <h2 className="font-display text-4xl md:text-5xl font-bold text-balance leading-[1.05] mb-5">
 <span className="text-slate-900">Empieza gratis hoy.</span>{" "}
 <span className="text-gradient-gold">Pro cuando estés listo.</span>
 </h2>
 <p className="text-slate-600 mb-8">
 Free para siempre. Pro 7 días sin tarjeta. Plan Solidario gratis si lo necesitás.
 </p>
 <div className="flex flex-col sm:flex-row gap-3 justify-center">
 <Button asChild size="xl">
 <Link href="/onboarding">
 Crear perfil
 <ChevronRight className="size-5" />
 </Link>
 </Button>
 <Button asChild size="xl" variant="secondary">
 <Link href="/pricing?audience=candidatos">Ver paquetes</Link>
 </Button>
 </div>
 </div>
 </section>
 </main>
 <Footer />
 </>
 );
}

function SuperPower({
 icon: Icon,
 num,
 title,
 desc,
 hero = false,
}: {
 icon: React.ComponentType<{ className?: string }>;
 num: string;
 title: string;
 desc: string;
 hero?: boolean;
}) {
 return (
 <div
 className={`rounded-2xl p-6 transition-all hover:-translate-y-0.5 ${
 hero
 ? "border-2 border-gold-400 bg-gradient-to-br from-gold-50 via-amber-50/40 to-white shadow-lg glow-gold lg:row-span-1"
 : "border border-slate-200 bg-white hover:shadow-md"
 }`}
 >
 <div className="flex items-start justify-between mb-3">
 <div
 className={`grid size-11 place-items-center rounded-xl ${
 hero
 ? "bg-gold-500 text-white shadow-md"
 : "bg-slate-100 border border-slate-200 text-slate-700"
 }`}
 >
 <Icon className="size-5" />
 </div>
 <span className={`font-mono text-xs font-bold ${hero ? "text-gold-700" : "text-slate-400"}`}>
 {num}
 </span>
 </div>
 <h3 className="font-display text-lg font-bold text-slate-900 mb-2 leading-tight">{title}</h3>
 <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
 </div>
 );
}

function StatBlock({
 big,
 label,
 detail,
 gold = false,
}: {
 big: string;
 label: string;
 detail: string;
 gold?: boolean;
}) {
 return (
 <div
 className={`rounded-2xl p-6 text-center ${
 gold
 ? "border-2 border-gold-300 bg-gradient-to-br from-gold-50 to-amber-50/60 glow-gold"
 : "border border-slate-200 bg-white"
 }`}
 >
 <p className={`font-display font-bold text-4xl md:text-5xl ${gold ? "text-gradient-gold" : "text-slate-900"}`}>
 {big}
 </p>
 <p className="mt-2 text-sm font-semibold text-slate-900">{label}</p>
 <p className="text-xs text-slate-500 font-mono">{detail}</p>
 </div>
 );
}

function StepCard({
 num,
 title,
 detail,
 caption,
 highlight = false,
}: {
 num: string;
 title: string;
 detail: string;
 caption: string;
 highlight?: boolean;
}) {
 return (
 <div
 className={`rounded-2xl p-6 ${
 highlight
 ? "border-2 border-gold-300 bg-gradient-to-br from-gold-50 to-amber-50/40 glow-gold"
 : "border border-slate-200 bg-white"
 }`}
 >
 <span className={`font-mono text-xs font-bold ${highlight ? "text-gold-700" : "text-slate-400"}`}>
 {num}
 </span>
 <h3 className="font-display text-xl font-bold text-slate-900 mt-2 mb-1">{title}</h3>
 <p className={`text-xs uppercase font-mono tracking-wider mb-3 ${highlight ? "text-gold-700" : "text-slate-500"}`}>
 {caption}
 </p>
 <p className="text-sm text-slate-600 leading-relaxed">{detail}</p>
 </div>
 );
}
