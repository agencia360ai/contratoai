"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Upload,
  CheckCircle2,
  Briefcase,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function CandidateHero() {
  return (
    <section className="relative mx-auto w-full pt-16 pb-16 px-4 md:px-8 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-grid-light" aria-hidden />

      <div
        className="absolute -z-10 left-1/2 top-0 h-[460px] w-[700px] -translate-x-1/2 rounded-full opacity-50 animate-drift-slow"
        style={{
          background: "radial-gradient(circle, rgba(251,191,36,0.30) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
        aria-hidden
      />
      <div
        className="absolute -z-10 right-[5%] top-[35%] h-[300px] w-[420px] rounded-full opacity-40 animate-drift-slow"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.20) 0%, transparent 70%)",
          filter: "blur(70px)",
          animationDelay: "3s",
        }}
        aria-hidden
      />

      <div className="max-w-7xl mx-auto">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6"
        >
          <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-700 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Para profesionales en Panamá
          </span>
        </motion.div>

        {/* Big headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tighter text-balance max-w-5xl mx-auto text-center"
        >
          <span className="text-slate-900">Consigue trabajo</span>{" "}
          <span className="text-gradient-gold">10× más rápido.</span>
        </motion.h1>

        {/* Clear "vs what" subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto text-pretty text-center"
        >
          En vez de aplicar a vacantes una por una en LinkedIn,{" "}
          <span className="text-slate-900 font-semibold">
            sube tu CV una sola vez
          </span>{" "}
          y la plataforma busca y aplica por ti.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <Button asChild size="xl" variant="primary" className="shadow-lg">
            <Link href="/onboarding">
              Crear mi perfil — gratis
              <ChevronRight className="size-5" aria-hidden />
            </Link>
          </Button>
          <Button asChild size="xl" variant="secondary">
            <Link href="/jobs">Ver 1,010+ vacantes</Link>
          </Button>
        </motion.div>

        {/* Free version super-prominent banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 max-w-4xl mx-auto"
        >
          <div className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-1.5 shadow-md">
            <div className="rounded-2xl bg-white p-6 md:p-7">
              <div className="flex items-start gap-4 mb-5">
                <div className="grid size-12 place-items-center rounded-xl bg-emerald-500 text-white shrink-0 shadow-md">
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.18em] text-emerald-700 mb-1">
                    Plan Free · Para siempre
                  </p>
                  <h2 className="font-display text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                    Empieza gratis. Sube de plan cuando quieras.
                  </h2>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <FreeFeature icon={Upload} text="Sube tu CV (PDF, foto)" />
                <FreeFeature icon={Search} text="Busca y aplica manualmente" />
                <FreeFeature icon={Briefcase} text="Ver las 1,010+ vacantes" />
              </div>

              <p className="mt-5 text-xs text-slate-500 text-center font-mono">
                Sin tarjeta · Sin compromiso · Sin límite de tiempo
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FreeFeature({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 px-3 py-2.5">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
        <Icon className="size-4" />
      </div>
      <span className="text-sm font-semibold text-slate-800 leading-tight">{text}</span>
    </div>
  );
}
