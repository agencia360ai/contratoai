"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
 Building2,
 Users2,
 ArrowRight,
 Workflow,
 Shield,
 Zap,
 Target,
 Bell,
 TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function DualHero() {
 return (
 <section className="relative mx-auto w-full pt-16 pb-16 px-4 md:px-8 overflow-hidden">
 <div className="absolute inset-0 -z-10 bg-grid-light" aria-hidden />

 {/* Soft gradient blobs */}
 <div
 className="absolute -z-10 left-1/2 top-0 h-[460px] w-[700px] -translate-x-1/2 rounded-full opacity-50 animate-drift-slow"
 style={{
 background: "radial-gradient(circle, rgba(251,191,36,0.30) 0%, transparent 65%)",
 filter: "blur(60px)",
 }}
 aria-hidden
 />

 {/* Big shared headline */}
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="text-center mb-4"
 >
 <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-700 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
 <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
 Reclutamiento ágil · Panamá
 </span>
 </motion.div>

 <motion.h1
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.1 }}
 className="font-display text-5xl md:text-7xl font-bold leading-[0.95] tracking-tighter text-balance max-w-5xl mx-auto text-center mb-4"
 >
 <span className="text-slate-900">10× más rápido.</span>{" "}
 <span className="text-gradient-gold">Para ambos lados.</span>
 </motion.h1>

 <motion.p
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.2 }}
 className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto text-center mb-12"
 >
 Sea que estés{" "}
 <span className="text-slate-900 font-semibold">contratando</span> o{" "}
 <span className="text-slate-900 font-semibold">buscando trabajo</span>,
 eliminamos las 40 horas perdidas en screening manual.
 </motion.p>

 {/* Dual cards */}
 <div className="grid lg:grid-cols-2 gap-5 max-w-6xl mx-auto">
 {/* COMPANY SIDE */}
 <motion.div
 initial={{ opacity: 0, x: -30 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.7, delay: 0.3 }}
 >
 <Link
 href="/empresas"
 className="group block rounded-3xl border-2 border-slate-200 bg-white p-8 hover:border-slate-900 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full"
 >
 <div className="flex items-start justify-between mb-6">
 <div className="grid size-14 place-items-center rounded-2xl bg-slate-900 text-white">
 <Building2 className="size-7" />
 </div>
 <ArrowRight className="size-6 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
 </div>

 <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500 mb-2">
 Para empresas
 </p>
 <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-[1.05]">
 Contrata{" "}
 <span className="text-gradient-gold">10× más rápido.</span>
 </h2>
 <p className="text-slate-600 mb-6 leading-relaxed">
 Recibe tu shortlist top 10 en 72 horas. Solo pagas cuando contratas.
 </p>

 <ul className="space-y-2.5 mb-7">
 <BenefitRow icon={Workflow} text="Procesamos 300+ CVs automáticamente" />
 <BenefitRow icon={Target} text="Pre-entrevistas estructuradas y grabadas" />
 <BenefitRow icon={Shield} text="Garantía de reemplazo hasta 90 días" />
 <BenefitRow icon={Zap} text="Setup en 90 segundos · Sin contratos" />
 </ul>

 <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
 <div>
 <p className="font-mono font-bold text-2xl text-slate-900">$0</p>
 <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
 Hasta tu primer hire
 </p>
 </div>
 <Button asChild size="default" variant="primary">
 <span>Empezar</span>
 </Button>
 </div>
 </Link>
 </motion.div>

 {/* CANDIDATE SIDE */}
 <motion.div
 initial={{ opacity: 0, x: 30 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.7, delay: 0.4 }}
 >
 <Link
 href="/candidatos"
 className="group block rounded-3xl border-2 border-gold-300 bg-gradient-to-br from-gold-50 via-amber-50/40 to-white p-8 hover:border-gold-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full glow-gold"
 >
 <div className="flex items-start justify-between mb-6">
 <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-md">
 <Users2 className="size-7" />
 </div>
 <ArrowRight className="size-6 text-gold-300 group-hover:text-gold-700 group-hover:translate-x-1 transition-all" />
 </div>

 <p className="text-xs font-mono uppercase tracking-[0.2em] text-gold-700 mb-2">
 Para candidatos
 </p>
 <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-[1.05]">
 Aplica a vacantes{" "}
 <span className="text-gradient-gold">sin esfuerzo.</span>
 </h2>
 <p className="text-slate-700 mb-6 leading-relaxed">
 La plataforma aplica por ti a las vacantes que coinciden con tu perfil. 24/7.
 </p>

 <ul className="space-y-2.5 mb-7">
 <BenefitRow icon={Zap} text="Auto-Apply: postulación automática 24/7" gold />
 <BenefitRow icon={Bell} text="Alertas WhatsApp cuando hay match >85%" gold />
 <BenefitRow icon={TrendingUp} text="CV Coach: mejoras tu perfil cada semana" gold />
 <BenefitRow icon={Target} text="DISC + Brújula completos · Salary insights" gold />
 </ul>

 <div className="pt-5 border-t border-gold-200/60 flex items-center justify-between">
 <div>
 <p className="font-mono font-bold text-2xl text-slate-900">$9</p>
 <p className="text-xs text-gold-700 font-mono uppercase tracking-wider">
 Pro · 7 días gratis
 </p>
 </div>
 <Button asChild size="default" variant="gold">
 <span>Probar Pro</span>
 </Button>
 </div>
 </Link>
 </motion.div>
 </div>

 {/* Trust strip */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.6, delay: 0.7 }}
 className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-600"
 >
 <span className="flex items-center gap-2">
 <span className="font-mono font-bold text-slate-900">1,010+</span>
 trabajos activos
 </span>
 <span className="text-slate-300">•</span>
 <span className="flex items-center gap-2">
 <span className="font-mono font-bold text-slate-900">234</span>
 empresas reales
 </span>
 <span className="text-slate-300">•</span>
 <span className="flex items-center gap-2">
 <span className="font-mono font-bold text-slate-900">72h</span>
 a tu shortlist
 </span>
 <span className="text-slate-300">•</span>
 <span className="flex items-center gap-2">
 <span className="font-mono font-bold text-emerald-700">92%</span>
 retención 90d
 </span>
 </motion.div>
 </section>
 );
}

function BenefitRow({
 icon: Icon,
 text,
 gold = false,
}: {
 icon: React.ComponentType<{ className?: string }>;
 text: string;
 gold?: boolean;
}) {
 return (
 <li className="flex items-start gap-2.5 text-sm">
 <div
 className={`grid size-5 shrink-0 place-items-center rounded-md ${
 gold ? "bg-gold-100 text-gold-700" : "bg-slate-100 text-slate-600"
 }`}
 >
 <Icon className="size-3" />
 </div>
 <span className="text-slate-700 leading-relaxed">{text}</span>
 </li>
 );
}
