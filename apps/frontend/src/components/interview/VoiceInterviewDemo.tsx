"use client";
import { useEffect, useState } from "react";
import { Mic, Play, Pause, FileText, Sparkles, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TRANSCRIPT = [
 { who: "ai", t: "Hola Carla, soy Moni. Voy a hacerte 5 preguntas rápidas. ¿Puedes contarme sobre un cliente difícil que recuerdes?" },
 { who: "user", t: "Claro. Hace dos meses una clienta entró 5 minutos antes de cerrar pidiendo ver toda la colección de bolsos Hermès..." },
 { who: "ai", t: "Y cómo manejaste el tiempo y la prisa de tu equipo?" },
 { who: "user", t: "Le ofrecí cita VIP al día siguiente con champagne. Cerró la venta de $4,800 y volvió 3 veces más." },
 { who: "ai", t: "Excelente. Una situación de venta cerrada con calidad de servicio. ¿Conoces el método CAR?" },
];

const ANALYSIS = [
 { label: "Match con el rol", value: 92, color: "emerald" as const },
 { label: "Soft skills (CAR)", value: 88, color: "gold" as const },
 { label: "Fit cultural retail luxury", value: 95, color: "violet" as const },
 { label: "Estabilidad emocional", value: 84, color: "cyan" as const },
];

export function VoiceInterviewDemo() {
 const [playing, setPlaying] = useState(false);
 const [step, setStep] = useState(0);
 const [showAnalysis, setShowAnalysis] = useState(false);

 useEffect(() => {
 if (!playing) return;
 if (step >= TRANSCRIPT.length) {
 setShowAnalysis(true);
 setPlaying(false);
 return;
 }
 const t = setTimeout(() => setStep((s) => s + 1), 1800);
 return () => clearTimeout(t);
 }, [playing, step]);

 return (
 <div className="rounded-3xl glass-strong p-1.5 shadow-glow-violet">
 <div className="rounded-[20px] bg-zinc-950 p-6 md:p-8 grid lg:grid-cols-2 gap-6">
 {/* Left — voice visualizer */}
 <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden">
 <div className="absolute inset-0 bg-radial-violet blur-3xl opacity-30" aria-hidden />

 {/* Animated mic visual */}
 <div className="relative">
 <div className={`grid size-32 place-items-center rounded-full bg-gradient-to-br from-cyan-500/30 to-violet-500/30 border-2 border-cyan-500/50 ${playing ? "shadow-glow-cyan animate-pulse-glow" : ""}`}>
 <Mic className={`size-12 ${playing ? "text-cyan-300" : "text-zinc-300"}`} />
 </div>

 {/* Audio waves when playing */}
 {playing && (
 <>
 <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-[ping_1.5s_ease-in-out_infinite]" />
 <div className="absolute -inset-4 rounded-full border border-cyan-500/15 animate-[ping_2s_ease-in-out_infinite]" />
 </>
 )}
 </div>

 <div className="mt-8 text-center">
 <Badge variant="ai" className="mb-3">
 <Sparkles className="size-3" /> Moni · IA Recruiter
 </Badge>
 <p className="text-sm text-zinc-400 mb-1">
 {playing ? "Escuchando..." : showAnalysis ? "Análisis listo" : "Demo · 30 segundos"}
 </p>
 <p className="text-xs font-mono text-zinc-500">
 ElevenLabs voice + Claude Sonnet 4.5
 </p>
 </div>

 {!showAnalysis && (
 <Button
 variant={playing ? "secondary" : "primary"}
 className="mt-6"
 onClick={() => {
 if (playing) {
 setPlaying(false);
 } else {
 setStep(0);
 setShowAnalysis(false);
 setPlaying(true);
 }
 }}
 >
 {playing ? <><Pause className="size-4" /> Pausar</> : <><Play className="size-4" /> Reproducir demo</>}
 </Button>
 )}
 {showAnalysis && (
 <Button
 variant="secondary"
 className="mt-6"
 onClick={() => {
 setShowAnalysis(false);
 setStep(0);
 }}
 >
 <Play className="size-4" /> Reproducir de nuevo
 </Button>
 )}
 </div>

 {/* Right — transcript / analysis */}
 <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 min-h-[360px]">
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
 <div className="flex items-center gap-2">
 <FileText className="size-4 text-zinc-400" />
 <h3 className="font-display font-bold text-zinc-100">
 {showAnalysis ? "Análisis IA" : "Transcripción en vivo"}
 </h3>
 </div>
 <span className="text-xs font-mono text-zinc-500">
 {showAnalysis ? "FINAL" : `${step}/${TRANSCRIPT.length}`}
 </span>
 </div>

 {!showAnalysis ? (
 <div className="space-y-3">
 {TRANSCRIPT.slice(0, step).map((m, i) => (
 <div
 key={i}
 className={`flex gap-2.5 animate-slide-in-left ${m.who === "user" ? "flex-row-reverse" : ""}`}
 >
 <div
 className={`shrink-0 size-8 rounded-full grid place-items-center text-xs font-bold ${
 m.who === "ai"
 ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
 : "bg-gold-500/20 border border-gold-500/40 text-gold-300"
 }`}
 >
 {m.who === "ai" ? "AI" : "C"}
 </div>
 <div
 className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[80%] ${
 m.who === "ai"
 ? "bg-cyan-500/[0.08] text-cyan-50 border border-cyan-500/20"
 : "bg-gold-500/[0.08] text-gold-50 border border-gold-500/20"
 }`}
 >
 {m.t}
 </div>
 </div>
 ))}
 {step === 0 && (
 <p className="text-zinc-500 text-sm italic text-center pt-12">
 Click "Reproducir demo" para ver la entrevista
 </p>
 )}
 </div>
 ) : (
 <div className="space-y-4 animate-fade-in">
 {ANALYSIS.map((m) => (
 <div key={m.label}>
 <div className="flex items-center justify-between mb-1.5">
 <span className="text-sm text-zinc-300">{m.label}</span>
 <span className={`font-mono font-bold text-sm ${getColor(m.color)}`}>
 {m.value}/100
 </span>
 </div>
 <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
 <div
 className={`h-full rounded-full ${getBg(m.color)}`}
 style={{ width: `${m.value}%` }}
 />
 </div>
 </div>
 ))}

 <div className="pt-4 mt-4 border-t border-white/5">
 <div className="flex items-center gap-2 mb-2">
 <Brain className="size-4 text-gold-400" />
 <span className="text-xs font-mono uppercase tracking-wider text-gold-300">
 Resumen ejecutivo
 </span>
 </div>
 <p className="text-sm text-zinc-300 leading-relaxed">
 Carla muestra dominio del lenguaje retail luxury y aplica método CAR
 espontáneamente. Cerró venta de $4,800 con storytelling sólido.
 Recomendamos avanzar a entrevista final con head of stores.
 </p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}

function getColor(c: "emerald" | "gold" | "violet" | "cyan") {
 return {
 emerald: "text-emerald-400",
 gold: "text-gold-400",
 violet: "text-violet-400",
 cyan: "text-cyan-400",
 }[c];
}
function getBg(c: "emerald" | "gold" | "violet" | "cyan") {
 return {
 emerald: "bg-gradient-to-r from-emerald-500/60 to-emerald-400",
 gold: "bg-gradient-to-r from-gold-500/60 to-gold-400",
 violet: "bg-gradient-to-r from-violet-500/60 to-violet-400",
 cyan: "bg-gradient-to-r from-cyan-500/60 to-cyan-400",
 }[c];
}
