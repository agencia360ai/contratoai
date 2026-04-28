import type { Metadata } from "next";
import Link from "next/link";
import {
 Building2,
 ChevronRight,
 Workflow,
 Shield,
 Zap,
 CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/animation/ScrollReveal";

export const metadata: Metadata = {
 title: "Para empresas — Shortlist en 72h, paga al cerrar",
 description:
 "Reemplazá 40h de screening manual. Solo pagas cuando contratas. Garantía 30-90 días.",
};

export default function EmpresasPage() {
 return (
 <>
 <Navbar />
 <main id="main">
 <section className="relative pt-24 pb-16 overflow-hidden">
 <div className="absolute inset-0 bg-grid-light" aria-hidden />
 <div
 className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full opacity-50"
 style={{
 background: "radial-gradient(circle, rgba(99,102,241,0.20) 0%, transparent 65%)",
 filter: "blur(60px)",
 }}
 aria-hidden
 />

 <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <Badge variant="default" className="mb-6">
 <Building2 className="size-3" /> Para empresas
 </Badge>

 <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tighter text-balance max-w-5xl mx-auto">
 <span className="text-slate-900">Contrata</span>{" "}
 <span className="text-gradient-gold">10× más rápido.</span>
 </h1>

 <p className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
 En vez de revisar 300 CVs en LinkedIn o pagar headhunter,{" "}
 <span className="text-slate-900 font-semibold">recibe tu shortlist top 10 en 72 horas</span>.
 Solo pagas si contratas.
 </p>

 <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
 <Button asChild size="xl">
 <Link href="/post-job">
 Publicar mi primera vacante
 <ChevronRight className="size-5" />
 </Link>
 </Button>
 <Button asChild size="xl" variant="secondary">
 <Link href="/contacto?source=empresas">Hablar con ventas</Link>
 </Button>
 </div>

 <p className="mt-6 text-xs font-mono uppercase tracking-wider text-slate-500">
 Sin tarjeta · Solo pagas cuando contratas
 </p>
 </div>
 </section>

 <section className="py-24 border-t border-slate-200">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <ScrollReveal className="text-center mb-14">
 <Badge variant="ai" className="mb-4">
 <Workflow className="size-3" /> Setup en 90 segundos
 </Badge>
 <h2 className="font-display text-4xl md:text-5xl font-bold text-balance leading-[1.05]">
 <span className="text-slate-900">Tres pasos.</span>{" "}
 <span className="text-gradient-gold">Cero burocracia.</span>
 </h2>
 </ScrollReveal>

 <div className="grid lg:grid-cols-3 gap-5">
 <StepCard num="01" title="Publicas tu vacante" caption="90 segundos" detail="Título, salario, must-haves. Auto-completamos descripción y skills. Edita si quieres." />
 <StepCard num="02" title="Hacemos el trabajo sucio" caption="Mientras duermes" detail="Procesamos 300+ CVs. Pre-entrevistamos a los top 50 con voz natural en español. Te llega todo el material." highlight />
 <StepCard num="03" title="Recibes tu shortlist" caption="Top 10 listo" detail="Con resumen, transcript, score DISC, salary match, red flags. Tú decides quién pasa a la entrevista final." />
 </div>
 </div>
 </section>

 <section className="py-24">
 <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
 <ScrollReveal className="text-center mb-12">
 <Badge variant="success" className="mb-4">
 <Shield className="size-3" /> Sin riesgo
 </Badge>
 <h2 className="font-display text-4xl md:text-5xl font-bold text-balance leading-[1.05]">
 <span className="text-slate-900">Tres garantías</span>{" "}
 <span className="text-gradient-gold">que el mercado no da.</span>
 </h2>
 </ScrollReveal>

 <div className="grid md:grid-cols-3 gap-5">
 <GuaranteeCard badge="$0" title="Pre-pago = $0" desc="No pagas un solo dólar hasta que el candidato firme contrato. Si no funciona, no pagas." />
 <GuaranteeCard badge="5 días" title="Shortlist en 5d o gratis" desc="Si en 5 días no entregamos al menos 5 candidatos pre-cualificados, cerramos sin cargo." />
 <GuaranteeCard badge="90d" title="Garantía de reemplazo" desc="Si tu nuevo hire renuncia o no funciona en 30-90 días (según plan), repetimos la búsqueda gratis." />
 </div>
 </div>
 </section>

 <section className="py-24 bg-slate-50/40">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <ScrollReveal className="text-center mb-12">
 <h2 className="font-display text-4xl md:text-5xl font-bold text-balance leading-[1.05]">
 <span className="text-slate-900">Cuatro paquetes.</span>{" "}
 <span className="text-gradient-gold">Para cada tamaño.</span>
 </h2>
 <p className="mt-3 text-slate-600">
 Empieza gratis. Escala cuando crezca tu volumen.
 </p>
 </ScrollReveal>

 <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
 <PackageCard tier="Starter" price="$0" cadence="hasta primer hire" addon="+ 1× salario al cerrar" desc="Ideal para tu primera contratación o roles puntuales." features={["1 vacante activa","Screening automatizado (300 CVs)","Shortlist top 10","Garantía 30 días","Soporte email"]} cta="Empezar gratis" ctaHref="/post-job" />
 <PackageCard tier="Pro" price="$299" cadence="por mes" addon="+ 0.5× salario al cerrar" desc="Para empresas con 3-10 contrataciones al mes." features={["5 vacantes simultáneas","AI Voice Interview incluido","Dashboard con métricas","Garantía 60 días","Soporte WhatsApp","Job board featured"]} cta="Probar Pro" ctaHref="/contacto?plan=pro" featured badge="MÁS ELEGIDO" />
 <PackageCard tier="Boutique" price="$999" cadence="por mes" addon="+ 1× salario al cerrar" desc="Roles ejecutivos y talento crítico. Mónica como consultora." features={["Todo lo de Pro","Mónica Díaz dedicada","Validación cultural","Negotiation support","Garantía 90 días","Reporting ejecutivo"]} cta="Hablar con Mónica" ctaHref="/contacto?plan=boutique" premium />
 <PackageCard tier="Enterprise" price="Custom" cadence="desde $2,500/mes" addon="Pricing por volumen" desc="+20 vacantes/mes, integración HRIS, account manager." features={["Todo lo de Boutique","Workday/SAP/BambooHR","API dedicada · SSO","Account manager","SLA contratado","Onboarding white-glove"]} cta="Hablar con ventas" ctaHref="/contacto?plan=enterprise" />
 </div>
 </div>
 </section>

 <section className="py-24">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <ScrollReveal className="text-center mb-12">
 <h2 className="font-display text-3xl md:text-4xl font-bold text-balance leading-[1.05]">
 <span className="text-slate-900">Lo que cambia cuando</span>{" "}
 <span className="text-gradient-gold">dejas de perder tiempo.</span>
 </h2>
 </ScrollReveal>

 <div className="grid md:grid-cols-3 gap-5">
 <CaseStudy industry="Retail luxury" client="Boutique multi-marca" problem="300 CVs por LinkedIn por puesto. CEO desesperada." outcome="Shortlist en 4 días. Hire al día 9." metric="11×" metricLabel="más rápido" />
 <CaseStudy industry="Aviación" client="Multinacional con hub Tocumen" problem="Vacante senior abierta 90 días. Talento se iba a CR." outcome="Cerrada con bilingüe en 6 días." metric="92%" metricLabel="retención 90d" />
 <CaseStudy industry="Banca" client="Top-3 Centro Bancario" problem="Compliance officer urgente. Recruiter saturado." outcome="1,200 CVs → 8 → contrato en 5 días." metric="$8k" metricLabel="ahorro vs headhunter" />
 </div>
 </div>
 </section>

 <section className="py-24">
 <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
 <div className="rounded-3xl bg-slate-900 text-white p-10 md:p-16 text-center relative overflow-hidden">
 <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, rgba(251,191,36,0.30) 0%, transparent 60%)" }} aria-hidden />
 <div className="relative">
 <Zap className="mx-auto size-12 text-gold-400 mb-5" aria-hidden />
 <h2 className="font-display text-4xl md:text-6xl font-bold text-balance leading-[1.05]">
 Tu shortlist,{" "}
 <span className="text-gradient-gold">esta semana.</span>
 </h2>
 <p className="mt-5 text-lg text-slate-300 max-w-xl mx-auto">
 Setup en 90 segundos. Si no entregamos en 5 días, no pagas.
 </p>
 <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
 <Button asChild size="xl" variant="gold">
 <Link href="/post-job">
 Publicar vacante
 <ChevronRight className="size-5" />
 </Link>
 </Button>
 <Button asChild size="xl" variant="secondary" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
 <Link href="/pricing?audience=empresas">Ver pricing</Link>
 </Button>
 </div>
 </div>
 </div>
 </div>
 </section>
 </main>
 <Footer />
 </>
 );
}

function StepCard({ num, title, caption, detail, highlight = false }: { num: string; title: string; caption: string; detail: string; highlight?: boolean }) {
 return (
 <div className={`rounded-2xl p-6 ${highlight ? "border-2 border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50/40 shadow-md glow-gold" : "border border-slate-200 bg-white"}`}>
 <span className={`grid size-12 place-items-center rounded-xl font-mono font-bold mb-4 ${highlight ? "bg-gold-500 text-white" : "bg-slate-100 border border-slate-200 text-slate-700"}`}>
 {num}
 </span>
 <h3 className="font-display text-xl font-bold text-slate-900 mb-1">{title}</h3>
 <p className={`text-xs uppercase font-mono tracking-wider mb-3 ${highlight ? "text-gold-700" : "text-slate-500"}`}>{caption}</p>
 <p className="text-sm text-slate-600 leading-relaxed">{detail}</p>
 </div>
 );
}

function GuaranteeCard({ badge, title, desc }: { badge: string; title: string; desc: string }) {
 return (
 <div className="rounded-2xl border-2 border-gold-300 bg-gradient-to-br from-gold-50 to-white p-6 hover:shadow-md transition-shadow">
 <div className="font-display font-bold text-5xl text-gradient-gold mb-3">{badge}</div>
 <h3 className="font-display text-xl font-bold text-slate-900 mb-2">{title}</h3>
 <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
 </div>
 );
}

function PackageCard({ tier, price, cadence, addon, desc, features, cta, ctaHref, featured = false, premium = false, badge }: { tier: string; price: string; cadence: string; addon: string; desc: string; features: string[]; cta: string; ctaHref: string; featured?: boolean; premium?: boolean; badge?: string }) {
 return (
 <div className={`relative rounded-2xl p-6 transition-all duration-300 ${featured ? "border-2 border-gold-400 bg-white shadow-lg glow-gold scale-100 md:scale-[1.03]" : premium ? "border-2 border-slate-900 bg-slate-900 text-white shadow-lg" : "border border-slate-200 bg-white hover:shadow-md hover:border-slate-300"}`}>
 {badge && (
 <div className="absolute -top-3 left-1/2 -translate-x-1/2">
 <Badge variant="gold" className="text-[10px] tracking-widest font-mono px-3 py-1 shadow-md">
 {badge}
 </Badge>
 </div>
 )}

 <h3 className={`font-display text-xl font-bold ${premium ? "text-white" : "text-slate-900"}`}>{tier}</h3>
 <p className={`text-sm mt-1 leading-relaxed ${premium ? "text-slate-300" : "text-slate-600"}`}>{desc}</p>

 <div className="mt-5 mb-5 pb-5 border-b border-slate-200/30">
 <div className="flex items-baseline gap-1">
 <span className={`font-display font-bold text-4xl ${featured ? "text-gradient-gold" : premium ? "text-white" : "text-slate-900"}`}>{price}</span>
 <span className={`text-sm ${premium ? "text-slate-400" : "text-slate-500"}`}>{cadence}</span>
 </div>
 <p className={`text-xs font-mono uppercase tracking-wider mt-1 ${premium ? "text-gold-400" : "text-gold-700"}`}>{addon}</p>
 </div>

 <ul className="space-y-2 mb-6">
 {features.map((f) => (
 <li key={f} className={`flex items-start gap-2 text-sm ${premium ? "text-slate-300" : "text-slate-700"}`}>
 <CheckCircle2 className={`size-4 shrink-0 mt-0.5 ${premium ? "text-gold-400" : "text-emerald-500"}`} />
 <span>{f}</span>
 </li>
 ))}
 </ul>

 <Button asChild size="default" variant={featured ? "primary" : premium ? "gold" : "secondary"} className="w-full">
 <Link href={ctaHref}>{cta}</Link>
 </Button>
 </div>
 );
}

function CaseStudy({ industry, client, problem, outcome, metric, metricLabel }: { industry: string; client: string; problem: string; outcome: string; metric: string; metricLabel: string }) {
 return (
 <div className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow">
 <Badge variant="default" className="mb-3">{industry}</Badge>
 <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-2">{client}</p>
 <p className="text-slate-600 mb-3 leading-relaxed text-sm">
 <span className="text-red-500 font-semibold">Antes:</span> {problem}
 </p>
 <p className="text-slate-700 mb-5 leading-relaxed text-sm">
 <span className="text-emerald-600 font-semibold">Después:</span> {outcome}
 </p>
 <div className="pt-4 border-t border-slate-100 flex items-baseline gap-2">
 <span className="font-display font-bold text-3xl text-gradient-gold">{metric}</span>
 <span className="text-xs text-slate-500 font-mono uppercase">{metricLabel}</span>
 </div>
 </div>
 );
}
