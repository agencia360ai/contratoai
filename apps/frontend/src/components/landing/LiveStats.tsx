"use client";
import { motion } from "framer-motion";
import { Briefcase, Users2, Building2, Mic } from "lucide-react";
import { AnimatedCounter } from "@/components/animation/AnimatedCounter";

const STATS = [
 { v: 790, suffix: "+", label: "Trabajos activos", icon: Briefcase, color: "from-amber-50 to-yellow-50 text-amber-700 border-amber-200" },
 { v: 234, suffix: "", label: "Empresas reales", icon: Building2, color: "from-indigo-50 to-violet-50 text-indigo-700 border-indigo-200" },
 { v: 4, suffix: "", label: "Fuentes scrapeadas", icon: Users2, color: "from-emerald-50 to-green-50 text-emerald-700 border-emerald-200" },
 { v: 72, suffix: "h", label: "A tu shortlist", icon: Mic, color: "from-cyan-50 to-sky-50 text-cyan-700 border-cyan-200" },
];

export function LiveStats() {
 return (
 <section className="py-16">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {STATS.map((s, i) => {
 const Icon = s.icon;
 return (
 <motion.div
 key={s.label}
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.5, delay: i * 0.08 }}
 className={`rounded-2xl border bg-gradient-to-br ${s.color} p-6 text-center`}
 >
 <Icon className="size-6 mx-auto mb-3 opacity-80" />
 <p className="font-display font-bold text-4xl md:text-5xl text-slate-900">
 <AnimatedCounter value={s.v} suffix={s.suffix} />
 </p>
 <p className="mt-1.5 text-sm font-semibold text-slate-700">{s.label}</p>
 </motion.div>
 );
 })}
 </div>
 </div>
 </section>
 );
}
