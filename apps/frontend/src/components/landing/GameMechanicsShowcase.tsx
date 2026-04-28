"use client";
import { motion } from "framer-motion";
import { Flame, Target, Sparkles, Eye, Zap, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/animation/ScrollReveal";

export function GameMechanicsShowcase() {
 return (
 <section className="py-24">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <ScrollReveal className="text-center mb-14">
 <Badge variant="ai" className="mb-4">
 <Sparkles className="size-3" /> Para candidatos
 </Badge>
 <h2 className="font-display text-4xl md:text-5xl font-bold text-balance leading-[1.05]">
 <span className="text-slate-900">Tu carrera,</span>{" "}
 <span className="text-gradient-gold">como un juego.</span>
 </h2>
 <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
 Cada acción te acerca al match perfecto. Sin competir contra nadie. Solo contra tu mejor versión.
 </p>
 </ScrollReveal>

 <div className="grid lg:grid-cols-3 gap-5">
 <ScrollReveal delay={0.05}>
 <ProfilePowerCard />
 </ScrollReveal>

 <ScrollReveal delay={0.15}>
 <StreakCard />
 </ScrollReveal>

 <ScrollReveal delay={0.25}>
 <MysteryRevealCard />
 </ScrollReveal>

 <ScrollReveal delay={0.35} className="lg:col-span-2">
 <SkillUnlockCard />
 </ScrollReveal>

 <ScrollReveal delay={0.45}>
 <DailyChallengeCard />
 </ScrollReveal>
 </div>
 </div>
 </section>
 );
}

// ─────────── Profile Power ───────────
function ProfilePowerCard() {
 return (
 <div className="rounded-2xl border border-slate-200 bg-white p-6 h-full hover:border-gold-300 hover:shadow-lg transition-all duration-300">
 <div className="flex items-center justify-between mb-4">
 <div className="grid size-11 place-items-center rounded-xl bg-gold-100 text-gold-700 border border-gold-200">
 <Target className="size-5" />
 </div>
 <Badge variant="gold" className="text-[10px]">PROFILE POWER</Badge>
 </div>
 <h3 className="font-display text-xl font-bold text-slate-900 mb-3">
 Tu perfil sube de nivel
 </h3>
 <p className="text-sm text-slate-600 mb-5 leading-relaxed">
 Más completo = más matches. Cada paso te acerca a empresas premium.
 </p>

 {/* Animated power bar */}
 <div className="space-y-3">
 <div className="flex items-center justify-between text-xs">
 <span className="font-mono uppercase tracking-wider text-slate-500">Power level</span>
 <span className="font-bold text-gold-700 font-mono">73 / 100</span>
 </div>
 <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
 <motion.div
 initial={{ width: "0%" }}
 whileInView={{ width: "73%" }}
 viewport={{ once: true }}
 transition={{ duration: 1.4, ease: "easeOut" }}
 className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600 shadow-[0_0_12px_rgba(251,191,36,0.50)]"
 />
 </div>
 <div className="grid grid-cols-2 gap-1.5 text-xs">
 {[
 { ok: true, t: "CV subido" },
 { ok: true, t: "Skills validados" },
 { ok: true, t: "DISC completo" },
 { ok: false, t: "Voz IA" },
 { ok: false, t: "Referencias" },
 { ok: false, t: "Portfolio" },
 ].map((i) => (
 <div key={i.t} className={`flex items-center gap-1.5 ${i.ok ? "text-slate-700" : "text-slate-400"}`}>
 <div className={`size-1.5 rounded-full ${i.ok ? "bg-emerald-500" : "bg-slate-300"}`} />
 {i.t}
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}

// ─────────── Streak ───────────
function StreakCard() {
 return (
 <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-orange-50/50 to-rose-50/50 p-6 h-full hover:shadow-lg transition-all duration-300 relative overflow-hidden">
 <motion.div
 animate={{ scale: [1, 1.1, 1], rotate: [0, 4, -4, 0] }}
 transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
 className="absolute -top-6 -right-6 text-7xl opacity-20"
 aria-hidden
 >
 🔥
 </motion.div>

 <div className="flex items-center justify-between mb-4 relative">
 <div className="grid size-11 place-items-center rounded-xl bg-orange-100 text-orange-700 border border-orange-200">
 <Flame className="size-5" />
 </div>
 <Badge variant="warning" className="text-[10px]">DAILY STREAK</Badge>
 </div>
 <h3 className="font-display text-xl font-bold text-slate-900 mb-3 relative">
 Racha de aplicaciones
 </h3>
 <div className="flex items-baseline gap-1 mb-3 relative">
 <span className="font-display font-bold text-6xl text-orange-600">12</span>
 <span className="text-slate-500">días</span>
 </div>
 <p className="text-sm text-slate-600 leading-relaxed mb-3 relative">
 Mantén la racha. Cada día activo te da prioridad en shortlists nuevas.
 </p>
 {/* Mini calendar */}
 <div className="flex gap-1 relative">
 {Array.from({ length: 14 }).map((_, i) => (
 <div
 key={i}
 className={`flex-1 h-6 rounded ${
 i < 12 ? "bg-gradient-to-b from-orange-400 to-orange-600" : "bg-slate-200"
 }`}
 />
 ))}
 </div>
 </div>
 );
}

// ─────────── Mystery Reveal ───────────
function MysteryRevealCard() {
 return (
 <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50/50 to-indigo-50/50 p-6 h-full hover:shadow-lg transition-all duration-300 relative overflow-hidden">
 <motion.div
 animate={{ y: [0, -6, 0] }}
 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
 className="absolute -bottom-2 -right-2 size-32 rounded-full opacity-20"
 style={{ background: "radial-gradient(circle, rgba(139,92,246,0.6), transparent 70%)" }}
 aria-hidden
 />
 <div className="flex items-center justify-between mb-4 relative">
 <div className="grid size-11 place-items-center rounded-xl bg-violet-100 text-violet-700 border border-violet-200">
 <Eye className="size-5" />
 </div>
 <Badge variant="ai" className="text-[10px]">MYSTERY MATCHES</Badge>
 </div>
 <h3 className="font-display text-xl font-bold text-slate-900 mb-3 relative">
 3 matches secretos
 </h3>
 <p className="text-sm text-slate-600 mb-4 leading-relaxed relative">
 Empresas que te quieren entrevistar. Completa tu perfil al 100% para ver quiénes son.
 </p>

 <div className="space-y-2 relative">
 {[1, 2, 3].map((n) => (
 <div
 key={n}
 className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-violet-200/40"
 >
 <div className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-400">
 <Lock className="size-4" />
 </div>
 <div className="flex-1">
 <div className="h-2 rounded bg-slate-200 w-32 mb-1.5" />
 <div className="h-1.5 rounded bg-slate-100 w-20" />
 </div>
 <span className="font-mono text-xs font-bold text-violet-700">
 {[94, 88, 82][n - 1]}%
 </span>
 </div>
 ))}
 </div>
 </div>
 );
}

// ─────────── Skill Unlock ───────────
function SkillUnlockCard() {
 return (
 <div className="rounded-2xl border border-slate-200 bg-white p-6 h-full hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
 <div className="flex items-center justify-between mb-4">
 <div className="grid size-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
 <Zap className="size-5" />
 </div>
 <Badge variant="success" className="text-[10px]">SKILL VALIDATIONS</Badge>
 </div>
 <h3 className="font-display text-xl font-bold text-slate-900 mb-3">
 Valida skills · desbloquea premium
 </h3>
 <p className="text-sm text-slate-600 mb-5 leading-relaxed">
 Mini-tests de 60 segundos por habilidad. Cada validation te da un badge verificado +50 XP.
 </p>

 <div className="grid sm:grid-cols-2 gap-3">
 {[
 { skill: "Excel avanzado", validated: true, xp: 50 },
 { skill: "Inglés B2", validated: true, xp: 50 },
 { skill: "SQL", validated: true, xp: 50 },
 { skill: "Liderazgo", validated: false, xp: 50 },
 { skill: "Negociación", validated: false, xp: 50 },
 { skill: "Python", validated: false, xp: 50 },
 ].map((s) => (
 <div
 key={s.skill}
 className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-colors ${
 s.validated
 ? "border-emerald-200 bg-emerald-50/40"
 : "border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
 }`}
 >
 <div
 className={`size-8 rounded-lg grid place-items-center text-xs font-bold ${
 s.validated ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
 }`}
 >
 {s.validated ? "✓" : "?"}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-slate-900 truncate">{s.skill}</p>
 <p className="text-xs text-slate-500 font-mono">+{s.xp} XP</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}

// ─────────── Daily challenge ───────────
function DailyChallengeCard() {
 return (
 <div className="rounded-2xl border-2 border-gold-300 bg-gradient-to-br from-gold-50 to-amber-50/50 p-6 h-full glow-gold relative overflow-hidden">
 <div className="flex items-center justify-between mb-4">
 <div className="grid size-11 place-items-center rounded-xl bg-white text-gold-700 border border-gold-300">
 <Sparkles className="size-5" />
 </div>
 <Badge variant="gold" className="text-[10px]">CHALLENGE DEL DÍA</Badge>
 </div>
 <h3 className="font-display text-xl font-bold text-slate-900 mb-3">
 Aplica a 1 match
 </h3>
 <p className="text-sm text-slate-700 mb-5 leading-relaxed">
 Empresas miran candidatos activos. Aplica a 1 match hoy = doble visibilidad mañana.
 </p>
 <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gold-200">
 <div className="font-display font-bold text-3xl text-gradient-gold">+30</div>
 <div className="flex-1">
 <p className="text-xs font-mono uppercase tracking-wider text-gold-700">Recompensa</p>
 <p className="text-sm font-semibold text-slate-900">XP + boost de visibilidad 24h</p>
 </div>
 </div>
 </div>
 );
}
