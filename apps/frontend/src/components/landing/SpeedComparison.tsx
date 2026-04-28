"use client";
import { motion } from "framer-motion";
import { Clock, Zap, AlertTriangle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SpeedComparison() {
 return (
 <section className="py-24 relative">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5 }}
 className="text-center mb-14"
 >
 <Badge variant="warning" className="mb-4">
 <AlertTriangle className="size-3" /> El proceso tradicional está roto
 </Badge>
 <h2 className="font-display text-4xl md:text-5xl font-bold text-balance leading-[1.05]">
 <span className="text-slate-900">Cada día sin contratar,</span>{" "}
 <span className="text-gradient-gold">pierdes plata.</span>
 </h2>
 </motion.div>

 <div className="grid lg:grid-cols-2 gap-5">
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5 }}
 className="rounded-3xl border border-red-200 bg-red-50/40 p-6 md:p-8 relative overflow-hidden"
 >
 <div className="flex items-center gap-3 mb-6">
 <div className="grid size-10 place-items-center rounded-xl bg-red-100 text-red-600">
 <Clock className="size-5" />
 </div>
 <Badge variant="destructive" className="text-[10px]">EL CAMINO LARGO</Badge>
 </div>
 <h3 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-1">
 Reclutamiento tradicional
 </h3>
 <p className="font-mono text-5xl md:text-6xl font-bold text-red-500 mb-1">
 45<span className="text-2xl ml-1">días</span>
 </p>
 <p className="text-sm text-slate-600 mb-6">+ tiempo perdido en cada step manual</p>

 <ul className="space-y-3">
 {[
 { d: "Día 1", t: "Publicas en LinkedIn, Computrabajo, Konzerta" },
 { d: "Día 5", t: "Llegan 300+ CVs en PDF" },
 { d: "Día 12", t: "Reclutador revisa CVs uno por uno (40h)" },
 { d: "Día 22", t: "Llamadas iniciales con 30" },
 { d: "Día 35", t: "Entrevistas presenciales con 8" },
 { d: "Día 45", t: "Candidato aceptado... que tomó otra oferta" },
 ].map((step, i) => (
 <li key={i} className="flex items-start gap-3 text-sm">
 <span className="font-mono text-xs font-bold text-red-500 shrink-0 w-14 mt-0.5">{step.d}</span>
 <span className="text-slate-600">{step.t}</span>
 </li>
 ))}
 </ul>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, x: 20 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, delay: 0.1 }}
 className="rounded-3xl border-2 border-gold-300 bg-gradient-to-br from-gold-50 via-amber-50/50 to-white p-6 md:p-8 relative overflow-hidden glow-gold"
 >
 <div className="flex items-center gap-3 mb-6">
 <div className="grid size-10 place-items-center rounded-xl bg-gold-100 text-gold-700">
 <Zap className="size-5" />
 </div>
 <Badge variant="gold" className="text-[10px]">CON TECONTRATO</Badge>
 </div>
 <h3 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-1">
 Reclutamiento con IA
 </h3>
 <p className="font-mono text-5xl md:text-6xl font-bold text-gradient-gold mb-1">
 3<span className="text-2xl ml-1 text-gold-700">días</span>
 </p>
 <p className="text-sm text-slate-700 mb-6">
 <span className="font-bold">15× más rápido.</span> Listo el viernes.
 </p>

 <ul className="space-y-3">
 {[
 { d: "Hora 0", t: "Subes vacante en 3 pasos (90s)" },
 { d: "Hora 4", t: "IA aplica por 1,200 candidatos" },
 { d: "Día 1", t: "AI Voice entrevista a top 50" },
 { d: "Día 2", t: "DISC + Brújula 8 ejes + transcripts" },
 { d: "Día 3", t: "Recibes shortlist de 10" },
 { d: "Día 4-5", t: "Decides → cierre" },
 ].map((step, i) => (
 <li key={i} className="flex items-start gap-3 text-sm">
 <span className="font-mono text-xs font-bold text-gold-700 shrink-0 w-14 mt-0.5">{step.d}</span>
 <span className="text-slate-700">{step.t}</span>
 </li>
 ))}
 </ul>
 </motion.div>
 </div>

 <motion.p
 initial={{ opacity: 0 }}
 whileInView={{ opacity: 1 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, delay: 0.3 }}
 className="mt-10 text-center text-sm text-slate-600 font-mono"
 >
 <Calendar className="inline size-4 mr-2 text-gold-600" />
 <span className="font-bold">Promesa:</span> sin shortlist en 5 días, no pagas.
 </motion.p>
 </div>
 </section>
 );
}
