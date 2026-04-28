import type { Metadata } from "next";
import Link from "next/link";
import { Mic, ChevronRight, Sparkles, Clock, FileText, Brain } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoiceInterviewDemo } from "@/components/interview/VoiceInterviewDemo";

export const metadata: Metadata = {
 title: "AI Voice Interview — Entrevista con IA en español",
 description: "5 minutos de conversación con IA. Te llega un análisis completo. Voz natural, preguntas contextualizadas por industria.",
};

export default function InterviewPage() {
 return (
 <>
 <Navbar />
 <main id="main">
 {/* HERO */}
 <section className="relative pt-24 pb-12 overflow-hidden">
 <div className="absolute inset-0 bg-grid-light" aria-hidden />
 <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-gradient-to-br from-violet-100/40 to-transparent blur-3xl opacity-50" aria-hidden />
 <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <Badge variant="ai" className="mb-5">
 <Sparkles className="size-3" /> Powered by ElevenLabs + Claude
 </Badge>
 <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tighter text-balance max-w-4xl mx-auto">
 <span className="text-gradient-premium">Entrevistas con IA</span>{" "}
 <span className="text-gradient-cyan">en español natural.</span>
 </h1>
 <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
 5 minutos de conversación contextualizada por industria. Te llega
 transcript, análisis de tono y resumen ejecutivo.
 </p>
 </div>
 </section>

 {/* DEMO */}
 <section className="py-16">
 <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
 <VoiceInterviewDemo />
 </div>
 </section>

 {/* WHAT IT EVALUATES */}
 <section className="py-16">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12 text-gradient-premium">
 Qué evalúa la IA en cada entrevista
 </h2>
 <div className="grid md:grid-cols-3 gap-5">
 <EvalCard
 num="01"
 title="Match con el rol"
 desc="Compara experiencia mencionada vs requisitos del job. Detecta si embellece o exagera."
 />
 <EvalCard
 num="02"
 title="Soft skills situacionales"
 desc='"¿Qué hiciste cuando un cliente estaba molesto?" Evalúa estructura CAR (Contexto, Acción, Resultado) tipo P&G.'
 highlight
 />
 <EvalCard
 num="03"
 title="Cultura + valores"
 desc="Para retail luxury evalúa estética del lenguaje. Para banca, ética. Para aviación, puntualidad."
 />
 </div>
 </div>
 </section>

 {/* BUSINESS CASES */}
 <section className="py-16 bg-gradient-to-b from-transparent via-zinc-950/40 to-transparent">
 <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
 <Badge variant="gold" className="mb-4 mx-auto block w-fit">
 <Brain className="size-3" /> Business Cases por industria
 </Badge>
 <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3 text-gradient-premium leading-[1.05]">
 Preguntas calibradas como las grandes consultoras.
 </h2>
 <p className="text-center text-slate-600 mb-10 max-w-xl mx-auto">
 Inspiradas en procesos de Adidas, P&G, Nestlé, Emirates. Adaptadas al rol y nivel.
 </p>

 <div className="grid md:grid-cols-2 gap-4">
 <CasePreview
 industry="Retail luxury"
 question="Una clienta entra a la boutique 5 min antes de cerrar y te pide ver toda la colección de bolsos. ¿Qué haces?"
 />
 <CasePreview
 industry="Banca"
 question="Un cliente VIP te pide un préstamo express y te ofrece propina por agilizarlo. ¿Cómo respondes?"
 />
 <CasePreview
 industry="Aviación"
 question="¿Alguna vez perdiste un vuelo? Si sí, ¿qué hiciste? Si no, ¿qué harías?"
 />
 <CasePreview
 industry="Tech / Startup"
 question="Tu CTO te pide implementar algo que sabes que es técnicamente incorrecto. ¿Qué haces?"
 />
 </div>
 </div>
 </section>

 {/* CTA */}
 <section className="py-24">
 <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
 <h2 className="font-display text-3xl md:text-5xl font-bold text-balance leading-[1.05] mb-5">
 <span className="text-gradient-premium">Tu próximo candidato</span>{" "}
 <span className="text-gradient-cyan">podría ser entrevistado hoy.</span>
 </h2>
 <p className="text-slate-600 mb-8">
 Activa AI Voice Interview cuando publiques tu próxima vacante. $0.40 por candidato entrevistado.
 </p>
 <Button asChild size="xl">
 <Link href="/post-job">
 Publicar vacante
 <ChevronRight className="size-5" />
 </Link>
 </Button>
 </div>
 </section>
 </main>
 <Footer />
 </>
 );
}

function EvalCard({ num, title, desc, highlight = false }: { num: string; title: string; desc: string; highlight?: boolean }) {
 return (
 <div
 className={`rounded-2xl p-6 ${
 highlight
 ? "border-2 border-cyan-500/40 bg-cyan-500/[0.04] shadow-md"
 : "border border-slate-200 bg-white backdrop-blur-xl"
 }`}
 >
 <span
 className={`font-mono text-xs ${highlight ? "text-cyan-400" : "text-slate-500"}`}
 >
 {num}
 </span>
 <h3 className="font-display text-xl font-bold text-slate-900 mt-2 mb-2">{title}</h3>
 <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
 </div>
 );
}

function CasePreview({ industry, question }: { industry: string; question: string }) {
 return (
 <div className="rounded-2xl border border-slate-200 bg-white backdrop-blur-xl p-5 hover:border-slate-200 transition-colors">
 <Badge variant="default" className="mb-3 text-[10px]">
 {industry.toUpperCase()}
 </Badge>
 <p className="text-slate-800 text-base leading-relaxed">"{question}"</p>
 </div>
 );
}
