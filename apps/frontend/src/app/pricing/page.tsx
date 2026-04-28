import type { Metadata } from "next";
import Link from "next/link";
import {
 Building2,
 Users2,
 CheckCircle2,
 X,
 Crown,
 Sparkles,
 ShieldCheck,
 Zap,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
 title: "Precios — Solo pagas cuando contratas (o aplicas)",
 description:
 "Empresas: Starter gratis hasta hire. Pro $299. Boutique $999. Candidatos: Free para siempre, Pro $9.",
};

export default function PricingPage({
 searchParams,
}: {
 searchParams: Promise<{ audience?: string }>;
}) {
 return (
 <>
 <Navbar />
 <PricingContent searchParams={searchParams} />
 <Footer />
 </>
 );
}

async function PricingContent({
 searchParams,
}: {
 searchParams: Promise<{ audience?: string }>;
}) {
 const params = await searchParams;
 const audience = params.audience === "candidatos" ? "candidatos" : "empresas";

 return (
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
 <Crown className="size-3" /> Pricing simple
 </Badge>
 <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tighter text-balance max-w-4xl mx-auto">
 <span className="text-slate-900">Solo pagas cuando</span>{" "}
 <span className="text-gradient-gold">obtienes resultado.</span>
 </h1>
 <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
 Empresas pagan al cerrar contrato. Candidatos pagan cuando quieren acelerar.
 Sin contratos. Cancelas cuando quieras.
 </p>
 </div>
 </section>

 {/* AUDIENCE TABS */}
 <section className="pb-4">
 <div className="mx-auto max-w-3xl px-4">
 <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
 <Link
 href="/pricing?audience=empresas"
 className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all cursor-pointer ${
 audience === "empresas"
 ? "bg-slate-900 text-white shadow-md"
 : "text-slate-600 hover:text-slate-900"
 }`}
 >
 <Building2 className="size-4" /> Empresas
 </Link>
 <Link
 href="/pricing?audience=candidatos"
 className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-all cursor-pointer ${
 audience === "candidatos"
 ? "bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-md"
 : "text-slate-600 hover:text-slate-900"
 }`}
 >
 <Users2 className="size-4" /> Candidatos
 </Link>
 </div>
 </div>
 </section>

 {/* PACKAGES */}
 {audience === "empresas" ? <CompanyPackages /> : <CandidatePackages />}

 {/* FAQ */}
 <section className="py-20">
 <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
 <h2 className="font-display text-3xl font-bold text-slate-900 text-center mb-10">
 Preguntas que escuchamos seguido
 </h2>
 <div className="space-y-3">
 {(audience === "empresas" ? FAQ_COMPANIES : FAQ_CANDIDATES).map((f, i) => (
 <details
 key={i}
 className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors cursor-pointer"
 >
 <summary className="font-display font-bold text-lg text-slate-900 list-none flex items-center justify-between gap-4">
 {f.q}
 <span className="font-mono text-xs text-slate-500 shrink-0 group-open:rotate-180 transition-transform">
 ▼
 </span>
 </summary>
 <p className="mt-3 text-slate-600 leading-relaxed">{f.a}</p>
 </details>
 ))}
 </div>
 </div>
 </section>
 </main>
 );
}

// ─────── COMPANY PACKAGES ───────
function CompanyPackages() {
 return (
 <section className="py-12">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
 <PkgCard
 tier="Starter"
 price="$0"
 cadence="hasta primer hire"
 addon="+ 1× salario al cerrar"
 desc="Tu primera contratación o búsqueda puntual."
 features={[
 { ok: true, t: "1 vacante activa" },
 { ok: true, t: "Screening automatizado (300 CVs)" },
 { ok: true, t: "Shortlist top 10" },
 { ok: true, t: "Garantía 30 días" },
 { ok: true, t: "Soporte email" },
 { ok: false, t: "AI Voice Interview" },
 { ok: false, t: "Mónica como consultora" },
 ]}
 cta="Empezar gratis"
 ctaHref="/post-job"
 />
 <PkgCard
 tier="Pro"
 price="$299"
 cadence="por mes"
 addon="+ 0.5× salario al cerrar"
 desc="3-10 contrataciones al mes. El sweet spot."
 features={[
 { ok: true, t: "5 vacantes simultáneas" },
 { ok: true, t: "AI Voice Interview", highlight: true },
 { ok: true, t: "Dashboard métricas" },
 { ok: true, t: "Garantía 60 días" },
 { ok: true, t: "Soporte WhatsApp" },
 { ok: true, t: "Job featured 7d", highlight: true },
 { ok: false, t: "Mónica dedicada" },
 ]}
 cta="Probar Pro"
 ctaHref="/contacto?plan=pro"
 featured
 badge="MÁS ELEGIDO"
 />
 <PkgCard
 tier="Boutique"
 price="$999"
 cadence="por mes"
 addon="+ 1× salario al cerrar"
 desc="Roles ejecutivos. Mónica como consultora dedicada."
 features={[
 { ok: true, t: "Todo lo de Pro" },
 { ok: true, t: "Mónica Díaz dedicada", highlight: true },
 { ok: true, t: "Validación cultural" },
 { ok: true, t: "Negotiation support" },
 { ok: true, t: "Garantía 90 días", highlight: true },
 { ok: true, t: "Reporting ejecutivo mensual" },
 ]}
 cta="Hablar con Mónica"
 ctaHref="/contacto?plan=boutique"
 premium
 />
 <PkgCard
 tier="Enterprise"
 price="Custom"
 cadence="desde $2,500/mes"
 addon="Pricing por volumen"
 desc="+20 vacantes/mes. HRIS integrado."
 features={[
 { ok: true, t: "Todo lo de Boutique" },
 { ok: true, t: "Workday/SAP/BambooHR" },
 { ok: true, t: "API dedicada · SSO" },
 { ok: true, t: "Account manager" },
 { ok: true, t: "SLA contratado" },
 { ok: true, t: "Onboarding white-glove" },
 ]}
 cta="Hablar con ventas"
 ctaHref="/contacto?plan=enterprise"
 />
 </div>

 <p className="mt-10 text-center text-sm text-slate-500">
 <ShieldCheck className="inline size-4 mr-1 text-emerald-600" />
 Sin shortlist en 5 días, no pagas · Solo pagas cuando hay contrato firmado
 </p>

 {/* Add-ons */}
 <div className="mt-16 rounded-3xl border border-slate-200 bg-slate-50/40 p-8">
 <h3 className="font-display text-xl font-bold text-slate-900 mb-1">Add-ons</h3>
 <p className="text-sm text-slate-600 mb-5">Disponibles en cualquier plan.</p>
 <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
 <Addon name="AI Voice Interview" price="$0.40 / candidato" desc="Entrevista pre-grabada de 5 min con voz natural en español." />
 <Addon name="Background check" price="$25 / candidato" desc="Verificación profesional con partner certificado." />
 <Addon name="Branding video" price="$500 one-time" desc="Video institucional 60s para tu employer branding." />
 <Addon name="Featured listing" price="$99 / 7 días" desc="Tu vacante destacada arriba en /jobs." />
 </div>
 </div>
 </div>
 </section>
 );
}

// ─────── CANDIDATE PACKAGES ───────
function CandidatePackages() {
 return (
 <section className="py-12">
 <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
 <div className="grid md:grid-cols-3 gap-4">
 <PkgCard
 tier="Free"
 price="$0"
 cadence="para siempre"
 addon=""
 desc="Crear perfil + postular manualmente. Para los que buscan tranquilo."
 features={[
 { ok: true, t: "Perfil estandarizado" },
 { ok: true, t: "Postular manual a vacantes públicas" },
 { ok: true, t: "DISC básico (4 dimensiones)" },
 { ok: true, t: "Email semanal de matches" },
 { ok: false, t: "Auto-Apply 24/7" },
 { ok: false, t: "Alertas WhatsApp" },
 { ok: false, t: "AI Voice Practice" },
 { ok: false, t: "Salary insights" },
 ]}
 cta="Crear cuenta"
 ctaHref="/onboarding"
 />
 <PkgCard
 tier="Pro"
 price="$9"
 cadence="por mes"
 addon="O $79/año (ahorrás 27%)"
 desc="Para los que están serios sobre cambiar de trabajo. Auto-Apply trabajando 24/7."
 features={[
 { ok: true, t: "Todo lo de Free" },
 { ok: true, t: "Auto-Apply 24/7", highlight: true },
 { ok: true, t: "Alertas WhatsApp en vivo", highlight: true },
 { ok: true, t: "AI Voice Practice ilimitado" },
 { ok: true, t: "DISC + Brújula 8 ejes completos" },
 { ok: true, t: "CV Coach semanal" },
 { ok: true, t: "Priority en shortlists empresas", highlight: true },
 { ok: true, t: "Salary insights por rol/empresa" },
 ]}
 cta="Probar 7 días gratis"
 ctaHref="/onboarding?plan=pro"
 featured
 badge="MÁS POPULAR"
 />
 <PkgCard
 tier="Career+"
 price="$19"
 cadence="por mes"
 addon=""
 desc="Plan de carrera real. Mentor humano + skill tracking."
 features={[
 { ok: true, t: "Todo lo de Pro" },
 { ok: true, t: "Mentor humano 1×/mes (call 30min)", highlight: true },
 { ok: true, t: "Career Goal Tracker (skills gap)" },
 { ok: true, t: "Cursos micro-learning recomendados" },
 { ok: true, t: "Verified Skills badges premium" },
 { ok: true, t: "Reviews CV personalizadas" },
 { ok: true, t: "Match guarantee: 1 entrevista en 30d", highlight: true },
 ]}
 cta="Empezar Career+"
 ctaHref="/onboarding?plan=career-plus"
 />
 </div>

 {/* Solidario plan */}
 <div className="mt-10 rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50/60 p-5 max-w-2xl mx-auto flex items-center gap-4">
 <div className="grid size-12 place-items-center rounded-xl bg-emerald-500 text-white shrink-0">
 <ShieldCheck className="size-6" />
 </div>
 <div>
 <p className="font-bold text-slate-900 mb-0.5">
 Plan Solidario · 100% gratis
 </p>
 <p className="text-sm text-slate-700">
 Si tu salario actual o aspiracional es menor a <strong>$1,000 USD</strong>, Pro
 es gratis mientras buscas. Verificación rápida con Cédula.
 </p>
 </div>
 <Button asChild size="default" variant="success" className="shrink-0">
 <Link href="/solidario">Aplicar</Link>
 </Button>
 </div>

 <p className="mt-8 text-center text-sm text-slate-500">
 <Sparkles className="inline size-4 mr-1 text-gold-600" />
 Cancelas cuando quieras · Sin tarjeta para empezar Pro
 </p>
 </div>
 </section>
 );
}

// ─────── PkgCard ───────
function PkgCard({
 tier,
 price,
 cadence,
 addon,
 desc,
 features,
 cta,
 ctaHref,
 featured = false,
 premium = false,
 badge,
}: {
 tier: string;
 price: string;
 cadence: string;
 addon: string;
 desc: string;
 features: { ok: boolean; t: string; highlight?: boolean }[];
 cta: string;
 ctaHref: string;
 featured?: boolean;
 premium?: boolean;
 badge?: string;
}) {
 return (
 <div
 className={`relative rounded-2xl p-6 transition-all duration-300 ${
 featured
 ? "border-2 border-gold-400 bg-white shadow-xl glow-gold scale-100 md:scale-[1.04]"
 : premium
 ? "border-2 border-slate-900 bg-slate-900 text-white shadow-lg"
 : "border border-slate-200 bg-white hover:shadow-md hover:border-slate-300"
 }`}
 >
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
 <span className={`font-display font-bold text-4xl md:text-5xl ${featured ? "text-gradient-gold" : premium ? "text-white" : "text-slate-900"}`}>
 {price}
 </span>
 <span className={`text-sm ${premium ? "text-slate-400" : "text-slate-500"}`}>{cadence}</span>
 </div>
 {addon && (
 <p className={`text-xs font-mono uppercase tracking-wider mt-1 ${premium ? "text-gold-400" : "text-gold-700"}`}>
 {addon}
 </p>
 )}
 </div>

 <ul className="space-y-2 mb-6">
 {features.map((f, i) => (
 <li key={i} className={`flex items-start gap-2 text-sm ${f.ok ? (premium ? "text-slate-200" : "text-slate-700") : "text-slate-400 line-through"}`}>
 {f.ok ? (
 <CheckCircle2 className={`size-4 shrink-0 mt-0.5 ${f.highlight ? "text-gold-500" : premium ? "text-gold-400" : "text-emerald-500"}`} />
 ) : (
 <X className="size-4 shrink-0 mt-0.5 text-slate-400" />
 )}
 <span className={f.highlight ? "font-semibold text-slate-900" : ""}>{f.t}</span>
 </li>
 ))}
 </ul>

 <Button
 asChild
 size="default"
 variant={featured ? "primary" : premium ? "gold" : "secondary"}
 className="w-full"
 >
 <Link href={ctaHref}>{cta}</Link>
 </Button>
 </div>
 );
}

function Addon({ name, price, desc }: { name: string; price: string; desc: string }) {
 return (
 <div className="rounded-xl border border-slate-200 bg-white p-4">
 <div className="flex items-baseline justify-between mb-1">
 <p className="font-bold text-slate-900 text-sm">{name}</p>
 </div>
 <p className="font-mono font-bold text-gold-700 text-sm mb-1">{price}</p>
 <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
 </div>
 );
}

const FAQ_COMPANIES = [
 { q: "¿Qué pasa si no encuentro el candidato adecuado?", a: "No nos pagas. Si en 5 días no entregamos al menos 5 candidatos pre-cualificados que cumplan tus must-haves, cerramos sin cargo." },
 { q: "¿Cómo funciona la garantía 90 días?", a: "Si tu nuevo hire renuncia o no funciona en los primeros 30-90 días según el plan, repetimos la búsqueda completa sin costo adicional." },
 { q: "¿Por qué Pro tiene fee mensual + 0.5× salario? ¿No es doble pago?", a: "Pro es para empresas con volumen — la fee mensual te da 5 vacantes simultáneas y AI Voice. Si solo necesitás 1 vacante esporádica, Starter es 100% performance-based ($0 hasta hire)." },
 { q: "¿De dónde salen los candidatos?", a: "Combinamos vacantes scrapeadas de Computrabajo, Encuentra24, Indeed, LinkedIn + nuestra base orgánica de candidatos Pro que crece con campañas QR + universidades aliadas." },
];

const FAQ_CANDIDATES = [
 { q: "¿Qué hace Auto-Apply exactamente?", a: 'Tu perfil queda en nuestra base. Cuando una vacante matchea >70% con tu perfil, postulamos automáticamente por ti en LinkedIn, Indeed o Computrabajo (la fuente original). Tú recibes email/WhatsApp cuando alguien responde.' },
 { q: "¿La empresa sabe que postulé automáticamente?", a: "No. Recibe tu CV + carta de presentación generada con tu información, idéntico a si tú hubieras postulado a mano. Cero diferencia en su lado." },
 { q: "¿Qué es CV Coach?", a: 'Cada lunes te llega un email con un score de tu CV (0-100) + 3 acciones específicas. Ej: "Tu CV scoreó 73. Agregá 2 logros cuantificables y subes a 84."' },
 { q: "¿Puedo cancelar Pro cuando quiera?", a: "Sí. Cancelas desde el dashboard. Conservás todo lo que ganaste (badges, validations, perfil) y vuelves al plan Free automáticamente." },
 { q: "¿El Plan Solidario es real?", a: "Sí. Si declarás salario aspiracional <$1k USD y verificás con Cédula panameña, Pro es 100% gratis hasta que consigas trabajo. Es parte de nuestra misión." },
];
