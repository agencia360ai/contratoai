"use client";
import Link from "next/link";
import { useState } from "react";
import {
 ArrowLeft,
 ArrowRight,
 CheckCircle2,
 Sparkles,
 Briefcase,
 DollarSign,
 Target,
 MapPin,
 Clock,
 Users2,
 Send,
 Brain,
 Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const STEPS = [
 { num: 1, label: "Lo básico" },
 { num: 2, label: "Detalles" },
 { num: 3, label: "Listo" },
];

export function PostJobWizard() {
 const [step, setStep] = useState(1);
 const [data, setData] = useState({
 title: "",
 salary: "",
 location: "Ciudad de Panamá",
 modality: "hybrid",
 musts: "",
 industry: "",
 useDISC: true,
 useVoiceInterview: true,
 });

 const update = (k: string, v: any) => setData((d) => ({ ...d, [k]: v }));

 return (
 <div>
 {/* Stepper */}
 <div className="mb-10">
 <div className="flex items-center justify-between mb-2">
 {STEPS.map((s, i) => (
 <div key={s.num} className="flex items-center gap-2 flex-1">
 <div
 className={`grid size-9 place-items-center rounded-full font-mono font-bold text-sm transition-colors ${
 step >= s.num
 ? "bg-gold-500 text-zinc-950 shadow-glow-gold"
 : "bg-white/[0.04] border border-white/10 text-zinc-500"
 }`}
 >
 {step > s.num ? <CheckCircle2 className="size-4" /> : s.num}
 </div>
 <span
 className={`text-sm font-medium hidden sm:inline ${step >= s.num ? "text-zinc-100" : "text-zinc-500"}`}
 >
 {s.label}
 </span>
 {i < STEPS.length - 1 && (
 <div
 className={`flex-1 h-px mx-2 ${step > s.num ? "bg-gold-500/40" : "bg-white/10"}`}
 />
 )}
 </div>
 ))}
 </div>
 <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
 Paso {step} de 3 · Toma menos de 90 segundos
 </p>
 </div>

 {/* Header */}
 {step < 3 && (
 <div className="mb-8 text-center">
 <Badge variant="ai" className="mb-4">
 <Sparkles className="size-3" /> AI auto-completa lo demás
 </Badge>
 <h1 className="font-display text-3xl md:text-4xl font-bold leading-[1.05] text-balance">
 {step === 1 ? (
 <>
 <span className="text-gradient-premium">Cuéntanos</span>{" "}
 <span className="text-gradient-gold">qué necesitas.</span>
 </>
 ) : (
 <>
 <span className="text-gradient-premium">Personaliza</span>{" "}
 <span className="text-gradient-gold">el filtro.</span>
 </>
 )}
 </h1>
 </div>
 )}

 {/* STEP 1 — basics */}
 {step === 1 && (
 <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 space-y-5">
 <Field label="Título de la vacante" icon={Briefcase}>
 <Input
 autoFocus
 placeholder="Ej: Desarrollador Frontend Senior"
 value={data.title}
 onChange={(e) => update("title", e.target.value)}
 />
 </Field>

 <Field label="Salario mensual (USD)" icon={DollarSign} hint="Visible al candidato. Empresas transparentes suben de bracket.">
 <Input
 type="text"
 placeholder="Ej: 2,500 - 3,500"
 value={data.salary}
 onChange={(e) => update("salary", e.target.value)}
 />
 </Field>

 <div className="grid sm:grid-cols-2 gap-5">
 <Field label="Ubicación" icon={MapPin}>
 <select
 className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-zinc-100"
 value={data.location}
 onChange={(e) => update("location", e.target.value)}
 >
 <option>Ciudad de Panamá</option>
 <option>San Miguelito</option>
 <option>David</option>
 <option>Colón</option>
 <option>Tocumen</option>
 <option>Otra</option>
 </select>
 </Field>
 <Field label="Modalidad" icon={Clock}>
 <div className="grid grid-cols-3 gap-1.5">
 {[
 { id: "onsite", l: "Presencial" },
 { id: "hybrid", l: "Híbrido" },
 { id: "remote", l: "Remoto" },
 ].map((m) => (
 <button
 key={m.id}
 onClick={() => update("modality", m.id)}
 className={`h-12 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
 data.modality === m.id
 ? "bg-gold-500/15 border border-gold-500/40 text-gold-300"
 : "border border-white/10 text-zinc-400 hover:bg-white/[0.04]"
 }`}
 >
 {m.l}
 </button>
 ))}
 </div>
 </Field>
 </div>

 <div className="flex justify-between pt-4">
 <Button variant="ghost" asChild>
 <Link href="/for-companies">
 <ArrowLeft className="size-4" /> Cancelar
 </Link>
 </Button>
 <Button
 variant="primary"
 size="lg"
 onClick={() => setStep(2)}
 disabled={!data.title || !data.salary}
 >
 Continuar
 <ArrowRight className="size-5" />
 </Button>
 </div>
 </div>
 )}

 {/* STEP 2 — must-haves + AI features */}
 {step === 2 && (
 <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 space-y-5">
 <Field
 label="Must-haves (máximo 5)"
 icon={Target}
 hint="Solo los EXCLUYENTES. Lo demás (nice-to-have, soft skills) la IA lo deduce de la descripción."
 >
 <textarea
 rows={4}
 className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:border-gold-500/50 focus-visible:ring-2 focus-visible:ring-gold-500/20"
 placeholder="• React + TypeScript&#10;• 5+ años de experiencia&#10;• Inglés B2+&#10;• Trabajó con equipos remotos"
 value={data.musts}
 onChange={(e) => update("musts", e.target.value)}
 />
 </Field>

 <Field label="Industria" icon={Users2} hint="Calibra el AI Voice Interview con preguntas específicas por sector.">
 <select
 className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-zinc-100"
 value={data.industry}
 onChange={(e) => update("industry", e.target.value)}
 >
 <option value="">Selecciona...</option>
 <option>Banca / Finanzas</option>
 <option>Tecnología / Software</option>
 <option>Aviación / Logística</option>
 <option>Retail / Lujo</option>
 <option>Belleza / Wellness</option>
 <option>BPO / Customer Service</option>
 <option>Salud</option>
 <option>Educación</option>
 <option>Otro</option>
 </select>
 </Field>

 <div className="space-y-3 pt-2">
 <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
 FILTROS AI ACTIVOS
 </p>

 <ToggleCard
 icon={Brain}
 title="Test DISC contextualizado"
 desc="Cada candidato hace un DISC ajustado a tu industria. Te llega el perfil con el shortlist."
 cost="+$0 · incluido"
 checked={data.useDISC}
 onChange={(v) => update("useDISC", v)}
 />
 <ToggleCard
 icon={Mic}
 title="AI Voice Interview"
 desc="La IA hace una entrevista de 5min con voz natural en español. Te llega transcript + análisis."
 cost="+$0.40/candidato"
 checked={data.useVoiceInterview}
 onChange={(v) => update("useVoiceInterview", v)}
 />
 </div>

 <div className="flex justify-between pt-4">
 <Button variant="secondary" onClick={() => setStep(1)}>
 <ArrowLeft className="size-4" /> Atrás
 </Button>
 <Button variant="primary" size="lg" onClick={() => setStep(3)}>
 Publicar vacante
 <Send className="size-5" />
 </Button>
 </div>
 </div>
 )}

 {/* STEP 3 — success */}
 {step === 3 && (
 <div className="rounded-3xl border border-gold-500/40 bg-gold-500/[0.04] backdrop-blur-xl p-8 md:p-12 text-center shadow-glow-gold relative overflow-hidden">
 <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-gold-400 to-transparent" aria-hidden />
 <div className="absolute -top-32 -right-32 size-64 rounded-full bg-radial-gold blur-2xl opacity-50" aria-hidden />
 <div className="relative">
 <div className="grid size-20 mx-auto place-items-center rounded-full bg-gold-500/15 border-2 border-gold-500/40 mb-6 shadow-glow-gold-strong">
 <CheckCircle2 className="size-10 text-gold-400" />
 </div>

 <h1 className="font-display text-4xl md:text-5xl font-bold leading-[1.05] text-balance mb-4">
 <span className="text-gradient-premium">¡Listo!</span>{" "}
 <span className="text-gradient-gold">La IA ya está trabajando.</span>
 </h1>

 <p className="text-lg text-zinc-300 mb-8 max-w-lg mx-auto">
 Tu vacante <strong className="text-zinc-100">"{data.title || "Vacante"}"</strong> está
 publicada. Empezamos a buscar candidatos en LinkedIn, Indeed,
 Computrabajo y nuestra base.
 </p>

 <div className="grid sm:grid-cols-3 gap-3 mb-8 text-left">
 <Timeline
 badge="HOY"
 title="IA filtra ~1,200 candidatos"
 detail="Mientras duermes"
 active
 />
 <Timeline
 badge="MAÑANA"
 title="50 entrevistas con voz"
 detail="DISC + análisis tono"
 />
 <Timeline
 badge="DÍA 3"
 title="Tu shortlist top 10"
 detail="Email + WhatsApp"
 />
 </div>

 <div className="flex flex-col sm:flex-row gap-3 justify-center">
 <Button asChild size="lg">
 <Link href="/recruiter">
 Ir a mi dashboard
 <ArrowRight className="size-5" />
 </Link>
 </Button>
 <Button variant="secondary" size="lg" onClick={() => { setStep(1); setData({ title: "", salary: "", location: "Ciudad de Panamá", modality: "hybrid", musts: "", industry: "", useDISC: true, useVoiceInterview: true }); }}>
 Publicar otra
 </Button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

function Field({
 label,
 icon: Icon,
 hint,
 children,
}: {
 label: string;
 icon: React.ComponentType<{ className?: string }>;
 hint?: string;
 children: React.ReactNode;
}) {
 return (
 <div>
 <label className="flex items-center gap-2 text-sm font-semibold text-zinc-200 mb-1.5">
 <Icon className="size-4 text-zinc-500" /> {label}
 </label>
 {children}
 {hint && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>}
 </div>
 );
}

function ToggleCard({
 icon: Icon,
 title,
 desc,
 cost,
 checked,
 onChange,
}: {
 icon: React.ComponentType<{ className?: string }>;
 title: string;
 desc: string;
 cost: string;
 checked: boolean;
 onChange: (v: boolean) => void;
}) {
 return (
 <button
 type="button"
 onClick={() => onChange(!checked)}
 className={`w-full text-left rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
 checked
 ? "border-2 border-gold-500/40 bg-gold-500/[0.04] shadow-glow-gold"
 : "border border-white/10 bg-white/[0.02] hover:border-white/20"
 }`}
 >
 <div className="flex items-start gap-3">
 <div
 className={`grid size-10 place-items-center rounded-xl shrink-0 ${
 checked
 ? "bg-gold-500/15 border border-gold-500/40 text-gold-300"
 : "bg-white/[0.04] border border-white/10 text-zinc-400"
 }`}
 >
 <Icon className="size-5" />
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between gap-3 mb-0.5">
 <p className="font-display font-bold text-zinc-100">{title}</p>
 <span className={`text-xs font-mono ${checked ? "text-gold-400" : "text-zinc-500"}`}>
 {cost}
 </span>
 </div>
 <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
 </div>
 <div
 className={`size-5 rounded-md border-2 shrink-0 mt-1 transition-colors ${
 checked ? "bg-gold-500 border-gold-500" : "border-white/20"
 }`}
 >
 {checked && <CheckCircle2 className="size-full text-zinc-950" />}
 </div>
 </div>
 </button>
 );
}

function Timeline({
 badge,
 title,
 detail,
 active = false,
}: {
 badge: string;
 title: string;
 detail: string;
 active?: boolean;
}) {
 return (
 <div
 className={`rounded-xl p-3 ${
 active
 ? "border border-gold-500/30 bg-gold-500/[0.04]"
 : "border border-white/5 bg-white/[0.02]"
 }`}
 >
 <p
 className={`text-[10px] font-mono uppercase tracking-wider mb-1 ${
 active ? "text-gold-400" : "text-zinc-500"
 }`}
 >
 {badge}
 </p>
 <p className="text-sm font-bold text-zinc-100 mb-0.5">{title}</p>
 <p className="text-xs text-zinc-500">{detail}</p>
 </div>
 );
}
