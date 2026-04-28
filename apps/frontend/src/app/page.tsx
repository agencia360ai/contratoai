import Link from "next/link";
import {
  ChevronRight,
  Zap,
  Bell,
  TrendingUp,
  Target,
  Sparkles,
  CheckCircle2,
  Brain,
  DollarSign,
  Building2,
  Mic,
  ArrowRight,
  Upload,
  FileText,
  Briefcase,
  Workflow,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { ClientLogosMarquee } from "@/components/landing/ClientLogosMarquee";
import { LiveStats } from "@/components/landing/LiveStats";
import { CandidateHero } from "@/components/landing/CandidateHero";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <CandidateHero />

        {/* TRUST BAND */}
        <section className="py-12 border-y border-slate-200/60 bg-slate-50/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-mono uppercase tracking-[0.2em] text-slate-500 mb-6">
              Empresas con vacantes activas
            </p>
            <ClientLogosMarquee />
          </div>
        </section>

        {/* THE 7 SUPERPOWERS */}
        <section className="py-24 bg-slate-50/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-14">
              <Badge variant="gold" className="mb-4">
                <Sparkles className="size-3" /> Plan Pro
              </Badge>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-balance leading-[1.05]">
                <span className="text-slate-900">7 superpoderes</span>{" "}
                <span className="text-gradient-gold">por $9 al mes.</span>
              </h2>
              <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
                Lo que recibes cuando subes de Free a Pro. Cancelas cuando quieras.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              <SuperPower icon={Zap} num="01" title="Auto-Apply 24/7" desc="Tu perfil postula automáticamente a todas las vacantes que coinciden. Aplicas a 50+ por semana sin levantar un dedo." hero />
              <SuperPower icon={TrendingUp} num="02" title="CV Coach semanal" desc='"Tu CV scoreó 73/100 esta semana. +5 puntos si agregas tu LinkedIn." Mejoras cada lunes.' />
              <SuperPower icon={Mic} num="03" title="Entrevista de práctica" desc="Practica entrevistas con voz natural, recibe feedback de tono, contenido y método CAR (P&G style)." />
              <SuperPower icon={Brain} num="04" title="DISC + Brújula completos" desc="Los 16 arquetipos, los 8 ejes, sugerencias de roles específicos donde brillas." />
              <SuperPower icon={Bell} num="05" title="Alertas WhatsApp en vivo" desc="¿Match >85% que aparece a las 11pm? Te avisamos. Antes de que la vacante cierre." />
              <SuperPower icon={Target} num="06" title="Priority en shortlist" desc="Cuando empresas filtran candidatos, tu perfil sale primero en la cola. +3× visibilidad." />
            </div>

            <ScrollReveal>
              <div className="mt-10 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-5 max-w-2xl mx-auto flex items-center gap-4">
                <div className="grid size-10 place-items-center rounded-xl bg-emerald-500 text-white shrink-0">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Plan Solidario · 100% gratis</p>
                  <p className="text-sm text-slate-700">
                    Si tu salario actual o aspirado es menor a $1,000 USD, Pro es gratis mientras
                    buscas. Verificación rápida con cédula.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <LiveStats />

        {/* HOW IT WORKS for candidates */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center mb-14">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-balance leading-[1.05]">
                <span className="text-slate-900">3 pasos.</span>{" "}
                <span className="text-gradient-gold">Empieza hoy.</span>
              </h2>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-5">
              <StepCard num="01" icon={Upload} title="Sube tu CV" detail="PDF, scan o foto. Lo procesamos automáticamente y armamos tu perfil estandarizado." caption="3 segundos" />
              <StepCard num="02" icon={Brain} title="Haz el DISC + Brújula" detail="Test de 5 minutos contextualizado por industria. Tu perfil queda completo." caption="5 minutos" highlight />
              <StepCard num="03" icon={Zap} title="Empieza a aplicar" detail="Aplicas manualmente con tu perfil completo. O activas Pro y la plataforma postula por ti." caption="Para siempre" />
            </div>
          </div>
        </section>

        {/* SWITCH TO COMPANIES */}
        <section className="py-20 bg-slate-900 text-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
                <div>
                  <Badge variant="default" className="mb-4 bg-white/10 text-gold-400 border-gold-500/30">
                    <Building2 className="size-3" /> Para empresas
                  </Badge>
                  <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 leading-[1.05]">
                    ¿Estás del otro lado de la mesa?
                  </h2>
                  <p className="text-slate-300 text-lg mb-1">
                    Si <span className="text-white font-semibold">contratas talento</span>, también
                    tenemos algo para ti:
                  </p>
                  <p className="font-display text-3xl font-bold text-gradient-gold">
                    Contrata 10× más rápido.
                  </p>
                </div>
                <Button asChild size="xl" variant="gold">
                  <Link href="/empresas">
                    Ver para empresas
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* MONICA TESTIMONIAL */}
        <section className="py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="rounded-3xl bg-white border border-slate-200 p-8 md:p-12 relative overflow-hidden shadow-xl">
                <Badge variant="gold" className="mb-4">
                  <Sparkles className="size-3" /> Por una experta en reclutamiento
                </Badge>
                <blockquote className="font-display text-2xl md:text-3xl font-medium leading-snug text-slate-900 mb-6 text-balance">
                  &ldquo;15 años en banca, aviación y retail luxury. Cuando vi que esto pre-filtra
                  300 CVs con calidad de consultor humano, supe que cambia el juego para Panamá.&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="grid size-12 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-white font-bold text-lg shadow-md">
                    M
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Mónica Díaz</p>
                    <p className="text-sm text-slate-600">
                      Recruitment boutique · Banco General, Copa, Saint Honoré, Heineken
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-balance leading-[1.05] mb-5">
              <span className="text-slate-900">Empieza gratis hoy.</span>{" "}
              <span className="text-gradient-gold">Pro cuando estés listo.</span>
            </h2>
            <p className="text-slate-600 mb-8 text-lg">
              Free para siempre · Pro 7 días sin tarjeta · Solidario gratis si lo necesitas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="xl">
                <Link href="/onboarding">
                  Crear mi perfil gratis
                  <ChevronRight className="size-5" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="secondary">
                <Link href="/jobs">Ver 1,010+ vacantes</Link>
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
      className={`rounded-2xl p-6 transition-all hover:-translate-y-0.5 h-full ${
        hero
          ? "border-2 border-gold-400 bg-gradient-to-br from-gold-50 via-amber-50/40 to-white shadow-lg glow-gold"
          : "border border-slate-200 bg-white hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`grid size-11 place-items-center rounded-xl ${
            hero ? "bg-gold-500 text-white shadow-md" : "bg-slate-100 border border-slate-200 text-slate-700"
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

function StepCard({
  num,
  icon: Icon,
  title,
  detail,
  caption,
  highlight = false,
}: {
  num: string;
  icon: React.ComponentType<{ className?: string }>;
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
      <div className="flex items-center justify-between mb-3">
        <span className={`font-mono text-xs font-bold ${highlight ? "text-gold-700" : "text-slate-400"}`}>
          {num}
        </span>
        <Icon className={`size-5 ${highlight ? "text-gold-700" : "text-slate-500"}`} aria-hidden />
      </div>
      <h3 className="font-display text-xl font-bold text-slate-900 mt-2 mb-1">{title}</h3>
      <p className={`text-xs uppercase font-mono tracking-wider mb-3 ${highlight ? "text-gold-700" : "text-slate-500"}`}>
        {caption}
      </p>
      <p className="text-sm text-slate-600 leading-relaxed">{detail}</p>
    </div>
  );
}
