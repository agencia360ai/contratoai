"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 ArrowLeft,
 Send,
 Sparkles,
 X,
 FileText,
 Briefcase,
 Brain,
 Bell,
 Upload,
 ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = {
 id: number;
 question: string;
 type: "chips" | "text" | "number" | "yes_no" | "multi_select" | "complete";
 options?: { id: string; label: string }[];
 placeholder?: string;
 hint?: string;
 field: string;
 allowText?: boolean;
};

const STEPS: Step[] = [
 { id: 1, field: "consent", question: "¡Hola! Soy Moni, tu asistente. En 5 minutos vamos a armar tu perfil para que las empresas te encuentren. Tus datos están seguros — solo los uso para encontrarte trabajos. ¿Empezamos?", type: "yes_no" },
 { id: 2, field: "name", question: "¿Cómo te llamas?", type: "text", placeholder: "Tu nombre" },
 { id: 3, field: "age_range", question: "¿En qué rango de edad estás?", type: "chips", options: [
 { id: "18-25", label: "18-25" }, { id: "26-35", label: "26-35" }, { id: "36-45", label: "36-45" }, { id: "46-55", label: "46-55" }, { id: "55+", label: "55+" },
 ]},
 { id: 4, field: "city", question: "¿En qué ciudad vives?", type: "chips", options: [
 { id: "panama", label: "Ciudad de Panamá" }, { id: "san_miguelito", label: "San Miguelito" }, { id: "david", label: "David" }, { id: "colon", label: "Colón" }, { id: "santiago", label: "Santiago" }, { id: "other", label: "Otra" },
 ], allowText: true },
 { id: 5, field: "experience_years", question: "¿Cuántos años de experiencia laboral llevas?", type: "chips", options: [
 { id: "0", label: "0 (primer empleo)" }, { id: "1", label: "1 año" }, { id: "2", label: "2 años" }, { id: "3", label: "3-5 años" }, { id: "6", label: "6-10 años" }, { id: "10", label: "10+ años" },
 ]},
 { id: 6, field: "education", question: "¿Cuál es tu nivel de estudios más alto?", type: "chips", options: [
 { id: "secundaria", label: "Secundaria" }, { id: "tecnico", label: "Técnico" }, { id: "universitario", label: "Universitario" }, { id: "postgrado", label: "Postgrado" }, { id: "otro", label: "Otro" },
 ]},
 { id: 7, field: "languages", question: "¿Qué idiomas hablas además de español?", type: "multi_select", options: [
 { id: "en", label: "Inglés" }, { id: "fr", label: "Francés" }, { id: "pt", label: "Portugués" }, { id: "zh", label: "Mandarín" }, { id: "none", label: "Solo español" },
 ]},
 { id: 8, field: "english_level", question: "Si hablas inglés, ¿cómo lo describirías?", type: "chips", options: [
 { id: "none", label: "No hablo" }, { id: "basic", label: "Básico" }, { id: "intermediate", label: "Intermedio" }, { id: "advanced", label: "Avanzado" }, { id: "native", label: "Nativo / bilingüe" },
 ]},
 { id: 9, field: "skills_top3", question: "Cuéntame las 3 habilidades en las que eres mejor.", type: "text", placeholder: "Ej: Excel, atención al cliente, ventas", hint: "Separadas por coma. Sin miedo, no es una entrevista." },
 { id: 10, field: "personality_orderly", question: "Cuando tienes un proyecto importante: ¿planificas todo desde el inicio o vas ajustando sobre la marcha?", type: "chips", options: [
 { id: "5", label: "Planifico todo" }, { id: "4", label: "Más planificada" }, { id: "3", label: "50/50" }, { id: "2", label: "Más improvisada" }, { id: "1", label: "Voy improvisando" },
 ]},
 { id: 11, field: "personality_social", question: "En reuniones grupales, normalmente eres:", type: "chips", options: [
 { id: "5", label: "El que lleva la conversación" }, { id: "4", label: "Activo, opino bastante" }, { id: "3", label: "Aporto cuando tengo algo claro" }, { id: "2", label: "Más bien escucho" }, { id: "1", label: "Prefiero observar" },
 ]},
 { id: 12, field: "interest_riasec", question: "¿Cuál de estas actividades te llama más?", type: "chips", options: [
 { id: "R", label: "Construir o arreglar cosas con las manos" }, { id: "I", label: "Investigar, analizar datos" }, { id: "A", label: "Crear, diseñar, escribir" }, { id: "S", label: "Ayudar y enseñar a otros" }, { id: "E", label: "Liderar y vender" }, { id: "C", label: "Organizar y revisar detalles" },
 ]},
 { id: 13, field: "salary_min", question: "¿Cuánto te gustaría ganar al mes (mínimo aceptable)? Tranquilo, esto solo lo ven empresas si tú lo aceptas.", type: "chips", options: [
 { id: "500", label: "$500-800" }, { id: "800", label: "$800-1,200" }, { id: "1200", label: "$1,200-2,000" }, { id: "2000", label: "$2,000-3,500" }, { id: "3500", label: "$3,500+" },
 ]},
 { id: 14, field: "modality", question: "¿Cómo prefieres trabajar?", type: "chips", options: [
 { id: "onsite", label: "Presencial" }, { id: "hybrid", label: "Híbrido" }, { id: "remote", label: "Remoto" }, { id: "any", label: "Cualquiera" },
 ]},
];

type Message = { who: "moni" | "user"; text: string; step?: number };

const STAGES = [
 { from: 1, to: 4, icon: Sparkles, label: "Lo básico" },
 { from: 5, to: 9, icon: Briefcase, label: "Tu experiencia" },
 { from: 10, to: 12, icon: Brain, label: "Tu personalidad" },
 { from: 13, to: 14, icon: Bell, label: "Preferencias" },
];

function currentStage(step: number) {
 return STAGES.findIndex((s) => step >= s.from && step <= s.to);
}

export function ChatOnboarding() {
 const [started, setStarted] = useState(false);
 const [messages, setMessages] = useState<Message[]>([
 { who: "moni", text: STEPS[0].question, step: 1 },
 ]);
 const [stepIdx, setStepIdx] = useState(0);
 const [, setAnswers] = useState<Record<string, unknown>>({});
 const [textInput, setTextInput] = useState("");
 const [multiSel, setMultiSel] = useState<string[]>([]);
 const [typing, setTyping] = useState(false);
 const [done, setDone] = useState(false);
 const containerRef = useRef<HTMLDivElement>(null);

 const currentStep = STEPS[stepIdx];
 const progress = Math.round(((stepIdx + (done ? 1 : 0)) / STEPS.length) * 100);
 const stage = currentStage(currentStep.id);

 useEffect(() => {
 containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" });
 }, [messages, typing]);

 function recordAnswer(value: unknown, label: string) {
 setMessages((m) => [...m, { who: "user", text: label }]);
 setAnswers((a) => ({ ...a, [currentStep.field]: value }));

 if (stepIdx >= STEPS.length - 1) {
 setTyping(true);
 setTimeout(() => {
 setTyping(false);
 setMessages((m) => [
 ...m,
 { who: "moni", text: "¡Listo! 🎉 Encontré varias vacantes que coinciden contigo. Vamos a verlas." },
 ]);
 setDone(true);
 }, 800);
 return;
 }

 setTyping(true);
 setTimeout(() => {
 setTyping(false);
 const nextIdx = stepIdx + 1;
 const next = STEPS[nextIdx];
 setMessages((m) => [...m, { who: "moni", text: next.question, step: next.id }]);
 setStepIdx(nextIdx);
 setMultiSel([]);
 setTextInput("");
 }, 700);
 }

 function handleChip(opt: { id: string; label: string }) {
 recordAnswer(opt.id, opt.label);
 }
 function handleYesNo(yes: boolean) {
 recordAnswer(yes, yes ? "Sí, empecemos" : "Mejor no");
 if (!yes && currentStep.id === 1) {
 setMessages((m) => [
 ...m,
 { who: "moni", text: "Sin problema. Cuando estés listo me avisas. Mientras tanto, puedes ver las vacantes sin perfil." },
 ]);
 setDone(true);
 }
 }
 function handleText(e: React.FormEvent) {
 e.preventDefault();
 const v = textInput.trim();
 if (!v) return;
 recordAnswer(v, v);
 }
 function handleMultiSubmit() {
 if (!multiSel.length) return;
 const labels = multiSel
 .map((id) => currentStep.options?.find((o) => o.id === id)?.label)
 .filter(Boolean)
 .join(", ");
 recordAnswer(multiSel, labels);
 }

 // Welcome screen before chat starts
 if (!started) {
 return <WelcomeScreen onStart={() => setStarted(true)} />;
 }

 return (
 <div className="mx-auto max-w-3xl px-4 pb-32">
 {/* Sticky header with Moni avatar + progress */}
 <div className="sticky top-0 z-20 -mx-4 mb-6 px-4 pt-4 bg-white/95 backdrop-blur-md border-b border-slate-200">
 <div className="flex items-center justify-between mb-3">
 <Link
 href="/"
 className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 cursor-pointer"
 >
 <ArrowLeft className="size-4" /> Salir
 </Link>
 <div className="flex items-center gap-3">
 <MoniBadge size="sm" online />
 <div className="text-right">
 <p className="text-sm font-bold text-slate-900 leading-none">Moni</p>
 <p className="text-xs text-emerald-600 font-mono">en línea</p>
 </div>
 </div>
 </div>

 {/* Stage tracker */}
 <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 hide-scrollbar">
 {STAGES.map((s, i) => {
 const Icon = s.icon;
 const passed = i < stage;
 const active = i === stage;
 return (
 <div
 key={s.label}
 className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
 passed
 ? "bg-emerald-100 text-emerald-700"
 : active
 ? "bg-slate-900 text-white"
 : "bg-slate-100 text-slate-400"
 }`}
 >
 <Icon className="size-3" aria-hidden />
 {s.label}
 </div>
 );
 })}
 </div>

 {/* Progress bar */}
 <div className="flex items-center justify-between mb-1.5 text-xs">
 <span className="font-mono uppercase tracking-wider text-slate-500">
 Paso {stepIdx + 1} de {STEPS.length}
 </span>
 <span className="font-mono font-bold text-slate-900">{progress}%</span>
 </div>
 <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mb-3">
 <motion.div
 className="h-full bg-gradient-to-r from-gold-400 to-gold-600"
 animate={{ width: `${progress}%` }}
 transition={{ duration: 0.5, ease: "easeOut" }}
 />
 </div>
 </div>

 {/* Conversation */}
 <div ref={containerRef} className="space-y-3 pb-6 max-h-[55vh] overflow-y-auto" aria-live="polite">
 <AnimatePresence initial={false}>
 {messages.map((m, i) => (
 <motion.div
 key={i}
 initial={{ opacity: 0, x: m.who === "moni" ? -10 : 10, y: 5 }}
 animate={{ opacity: 1, x: 0, y: 0 }}
 transition={{ duration: 0.2 }}
 className={`flex items-end gap-2 ${m.who === "user" ? "justify-end" : "justify-start"}`}
 >
 {m.who === "moni" && <MoniBadge size="xs" />}
 <div
 className={
 m.who === "user"
 ? "max-w-[80%] rounded-2xl rounded-br-sm bg-slate-900 text-white px-4 py-3 text-base shadow-sm"
 : "max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-100 text-slate-900 px-4 py-3 text-base"
 }
 >
 {m.text}
 </div>
 </motion.div>
 ))}
 </AnimatePresence>

 {typing && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2">
 <MoniBadge size="xs" />
 <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3">
 <span className="inline-flex gap-1">
 {[0, 1, 2].map((i) => (
 <span
 key={i}
 className="size-1.5 rounded-full bg-slate-400 animate-pulse"
 style={{ animationDelay: `${i * 150}ms` }}
 />
 ))}
 </span>
 </div>
 </motion.div>
 )}
 </div>

 {/* Input area sticky bottom */}
 {!done && !typing && (
 <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-md p-4 pb-6">
 <div className="mx-auto max-w-3xl">
 {currentStep.hint && (
 <p className="text-xs text-slate-500 mb-2 text-center">{currentStep.hint}</p>
 )}

 {currentStep.type === "yes_no" && (
 <div className="flex gap-2">
 <Button variant="secondary" size="lg" className="flex-1" onClick={() => handleYesNo(false)}>
 <X className="size-4" /> Mejor no
 </Button>
 <Button variant="primary" size="lg" className="flex-1" onClick={() => handleYesNo(true)}>
 Sí, empecemos
 <ChevronRight className="size-4" />
 </Button>
 </div>
 )}

 {currentStep.type === "chips" && (
 <>
 <div className="flex flex-wrap gap-2 mb-2">
 {currentStep.options?.map((o) => (
 <button
 key={o.id}
 onClick={() => handleChip(o)}
 className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors cursor-pointer"
 >
 {o.label}
 </button>
 ))}
 </div>
 {currentStep.allowText && (
 <form onSubmit={handleText} className="flex gap-2 mt-2">
 <Input
 value={textInput}
 onChange={(e) => setTextInput(e.target.value)}
 placeholder="O escribe otra opción"
 className="flex-1"
 />
 <Button type="submit" size="default" disabled={!textInput.trim()}>
 <Send className="size-4" />
 </Button>
 </form>
 )}
 </>
 )}

 {currentStep.type === "text" && (
 <form onSubmit={handleText} className="flex gap-2">
 <Input
 autoFocus
 value={textInput}
 onChange={(e) => setTextInput(e.target.value)}
 placeholder={currentStep.placeholder}
 className="flex-1"
 />
 <Button type="submit" size="default" disabled={!textInput.trim()}>
 <Send className="size-4" /> Enviar
 </Button>
 </form>
 )}

 {currentStep.type === "multi_select" && (
 <>
 <div className="flex flex-wrap gap-2 mb-3">
 {currentStep.options?.map((o) => {
 const sel = multiSel.includes(o.id);
 return (
 <button
 key={o.id}
 onClick={() =>
 setMultiSel((prev) => (sel ? prev.filter((x) => x !== o.id) : [...prev, o.id]))
 }
 className={`rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
 sel
 ? "border-slate-900 bg-slate-900 text-white"
 : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
 }`}
 >
 {o.label}
 </button>
 );
 })}
 </div>
 <Button size="lg" className="w-full" onClick={handleMultiSubmit} disabled={!multiSel.length}>
 Continuar
 <ChevronRight className="size-4" />
 </Button>
 </>
 )}
 </div>
 </div>
 )}

 {done && (
 <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-md p-4 pb-6">
 <div className="mx-auto max-w-3xl">
 <Button asChild size="xl" variant="primary" className="w-full">
 <Link href="/matches">Ver mis matches</Link>
 </Button>
 <p className="mt-2 text-center text-xs text-slate-500">
 ✨ Perfil completo. Tu plan Free siempre está activo.
 </p>
 </div>
 </div>
 )}
 </div>
 );
}

// ────────────────────────────────────────────────
// Welcome screen — visible before chat starts
// ────────────────────────────────────────────────
function WelcomeScreen({ onStart }: { onStart: () => void }) {
 return (
 <div className="mx-auto max-w-2xl px-4 pt-12 pb-12">
 {/* Top bar */}
 <Link
 href="/"
 className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 cursor-pointer mb-8"
 >
 <ArrowLeft className="size-4" /> Volver
 </Link>

 {/* Main intro card */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm relative overflow-hidden"
 >
 <div
 className="absolute -top-20 -right-20 size-64 rounded-full opacity-50"
 style={{ background: "radial-gradient(circle, rgba(251,191,36,0.30), transparent 70%)", filter: "blur(40px)" }}
 aria-hidden
 />

 <div className="relative">
 {/* Moni intro */}
 <div className="flex items-center gap-4 mb-6">
 <MoniBadge size="lg" online />
 <div>
 <h1 className="font-display text-2xl font-bold text-slate-900 leading-tight">
 Hola, soy Moni
 </h1>
 <p className="text-sm text-emerald-600 font-mono">
 Tu asistente personal · en línea
 </p>
 </div>
 </div>

 <p className="text-lg text-slate-700 leading-relaxed mb-6">
 En 5 minutos vamos a armar tu perfil para que las empresas te encuentren.{" "}
 <span className="text-slate-900 font-semibold">Te haré 14 preguntas rápidas</span> y al
 final tendrás tu match personalizado con los trabajos disponibles.
 </p>

 {/* What you'll get */}
 <div className="rounded-2xl bg-slate-50 p-5 mb-6">
 <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3">
 Al terminar tendrás
 </p>
 <ul className="space-y-2.5">
 <BenefitRow icon={FileText} text="Perfil profesional completo" />
 <BenefitRow icon={Brain} text="Tu DISC + tipo de trabajador ideal" />
 <BenefitRow icon={Briefcase} text="Vacantes que coinciden con tu perfil" />
 <BenefitRow icon={Bell} text="Alertas cuando aparezcan trabajos para ti" />
 </ul>
 </div>

 {/* CV upload alternative */}
 <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 mb-6 hover:border-gold-400 transition-colors cursor-pointer group">
 <div className="flex items-center gap-3">
 <div className="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-gold-100 group-hover:text-gold-700 transition-colors">
 <Upload className="size-5" />
 </div>
 <div className="flex-1">
 <p className="font-semibold text-slate-900 text-sm">
 ¿Tienes CV en PDF? Súbelo
 </p>
 <p className="text-xs text-slate-600">Lo procesamos en 3 segundos. Solo confirmas datos.</p>
 </div>
 <ChevronRight className="size-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
 </div>
 </div>

 <Button onClick={onStart} size="xl" variant="primary" className="w-full">
 Empezar — 5 minutos
 <ChevronRight className="size-5" />
 </Button>
 <p className="mt-3 text-center text-xs text-slate-500 font-mono">
 Plan Free · Sin tarjeta · Sin compromiso
 </p>
 </div>
 </motion.div>

 {/* Privacy note */}
 <p className="mt-6 text-center text-xs text-slate-500 leading-relaxed">
 Tus respuestas están protegidas por la <strong>Ley 81 de Panamá</strong>.
 <br />
 Solo las empresas a las que apliques pueden ver tu perfil.
 </p>
 </div>
 );
}

function BenefitRow({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
 return (
 <li className="flex items-center gap-2.5 text-sm text-slate-700">
 <div className="grid size-6 shrink-0 place-items-center rounded-md bg-emerald-100 text-emerald-600">
 <Icon className="size-3.5" />
 </div>
 <span>{text}</span>
 </li>
 );
}

// ────────────────────────────────────────────────
// Moni avatar component — friendly, with online indicator
// ────────────────────────────────────────────────
function MoniBadge({
 size = "md",
 online = false,
}: {
 size?: "xs" | "sm" | "md" | "lg";
 online?: boolean;
}) {
 const sizing = {
 xs: "size-8 text-sm",
 sm: "size-10 text-base",
 md: "size-12 text-lg",
 lg: "size-16 text-2xl",
 }[size];
 const indicatorSize = {
 xs: "size-2",
 sm: "size-2.5",
 md: "size-3",
 lg: "size-4",
 }[size];

 return (
 <div className="relative shrink-0">
 <div
 className={`grid ${sizing} place-items-center rounded-full bg-gradient-to-br from-gold-300 via-gold-400 to-amber-600 text-white font-display font-bold shadow-md ring-2 ring-white`}
 aria-hidden
 >
 M
 </div>
 {online && (
 <span
 className={`absolute bottom-0 right-0 ${indicatorSize} rounded-full bg-emerald-500 ring-2 ring-white animate-pulse`}
 aria-label="en línea"
 />
 )}
 </div>
 );
}
