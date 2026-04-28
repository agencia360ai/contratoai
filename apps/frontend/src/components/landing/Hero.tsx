"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Workflow, Zap, Shield, Gauge, ListChecks, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
 return (
 <section className="relative mx-auto w-full pt-20 pb-20 px-6 text-center md:px-8 overflow-hidden">
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
 background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
 filter: "blur(70px)",
 animationDelay: "3s",
 }}
 aria-hidden
 />

 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="inline-block mb-6"
 >
 <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-700 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
 <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
 Reclutamiento automatizado · Panamá
 </span>
 </motion.div>

 <motion.h1
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.1 }}
 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tighter text-balance max-w-5xl mx-auto"
 >
 <span className="text-slate-900">Contrata</span>{" "}
 <span className="text-gradient-gold inline-block">10× más rápido</span>{" "}
 <span className="text-slate-400">que la forma tradicional.</span>
 </motion.h1>

 <motion.p
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.25 }}
 className="mt-6 text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto text-pretty"
 >
 Proceso ágil que reemplaza{" "}
 <span className="text-slate-900 font-semibold">40 horas semanales</span> de
 screening manual. Tu shortlist top 10{" "}
 <span className="text-slate-900 font-semibold">en 72 horas</span>.
 </motion.p>

 <motion.div
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6, delay: 0.4 }}
 className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center"
 >
 <Button asChild size="xl" variant="primary" className="shadow-lg">
 <Link href="/for-companies">
 Probar gratis — sin tarjeta
 <ChevronRight className="size-5" aria-hidden />
 </Link>
 </Button>
 <Button asChild size="xl" variant="secondary">
 <Link href="/onboarding">Soy candidato</Link>
 </Button>
 </motion.div>

 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.6, delay: 0.55 }}
 className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500"
 >
 <span className="flex items-center gap-1.5">
 <Gauge className="size-3.5" aria-hidden /> Setup en 90 segundos
 </span>
 <span className="text-slate-300">•</span>
 <span className="flex items-center gap-1.5">
 <Workflow className="size-3.5" aria-hidden /> Proceso 100% ágil
 </span>
 <span className="text-slate-300">•</span>
 <span className="flex items-center gap-1.5">
 <Shield className="size-3.5" aria-hidden /> Garantía 90 días
 </span>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, y: 40 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8, delay: 0.6 }}
 className="mt-16 max-w-5xl mx-auto relative"
 >
 <div
 className="absolute inset-0 rounded-3xl"
 style={{
 background: "radial-gradient(circle at 50% 0%, rgba(251,191,36,0.12) 0%, transparent 60%)",
 filter: "blur(20px)",
 }}
 aria-hidden
 />
 <div className="relative rounded-3xl border border-slate-200 bg-white p-1.5 shadow-2xl">
 <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white p-5 md:p-8 grid md:grid-cols-3 gap-5">
 <PreviewStep
 num="01"
 icon={ListChecks}
 title="Publicas en 90 segundos"
 caption="Cero burocracia"
 detail="Título, salario, must-haves. Listo."
 />
 <PreviewStep
 num="02"
 icon={Workflow}
 title="Automatizamos el screening"
 caption="Mientras duermes"
 detail="Filtramos 300+ CVs y pre-entrevistamos a los top 50."
 highlight
 />
 <PreviewStep
 num="03"
 icon={CheckCircle2}
 title="Recibes tu shortlist"
 caption="Top 10 listos"
 detail="Cierras la oferta antes del weekend."
 />
 </div>
 </div>
 </motion.div>
 </section>
 );
}

function PreviewStep({
 num,
 icon: Icon,
 title,
 caption,
 detail,
 highlight = false,
}: {
 num: string;
 icon: React.ComponentType<{ className?: string }>;
 title: string;
 caption: string;
 detail: string;
 highlight?: boolean;
}) {
 return (
 <div
 className={`rounded-xl p-5 transition-all duration-300 ${
 highlight
 ? "border-2 border-gold-300 bg-gradient-to-br from-gold-50 to-amber-50/50 shadow-md"
 : "border border-slate-200 bg-white hover:border-slate-300"
 }`}
 >
 <div className="flex items-center justify-between mb-3">
 <span className={`font-mono text-xs font-bold ${highlight ? "text-gold-700" : "text-slate-400"}`}>{num}</span>
 <Icon className={`size-5 ${highlight ? "text-gold-600" : "text-slate-500"}`} aria-hidden />
 </div>
 <h3 className="font-display text-lg font-bold text-slate-900 mb-1 text-left">{title}</h3>
 <p className={`text-xs uppercase font-mono tracking-wider mb-2 text-left ${highlight ? "text-gold-700" : "text-slate-500"}`}>{caption}</p>
 <p className="text-sm text-slate-600 leading-relaxed text-left">{detail}</p>
 </div>
 );
}
