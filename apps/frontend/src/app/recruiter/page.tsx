import type { Metadata } from "next";
import Link from "next/link";
import {
 CheckCircle2,
 Clock,
 Sparkles,
 Target,
 Trophy,
 Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
 title: "Dashboard reclutador",
};

const DEMO_RECRUITER = {
 id: "demo-r",
 display_name: "María González",
 title: "Talent Acquisition Manager",
 score: 4210,
 rank: 47,
 avg_response_time_h: 3.4,
 interviews_held: 18,
 hires_completed: 7,
 company: { name: "Agencia360", score: 2890 },
};

const DEMO_APPLICATIONS = [
 {
 id: "a1",
 status: "interview",
 applied_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
 candidate: { display_name: "Carlos Méndez" },
 },
 {
 id: "a2",
 status: "viewed",
 applied_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
 candidate: { display_name: "Ana Patricia López" },
 },
 {
 id: "a3",
 status: "sent",
 applied_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
 candidate: { display_name: "Luis Fernández" },
 },
 {
 id: "a4",
 status: "rejected",
 applied_at: new Date(Date.now() - 3600 * 1000 * 28).toISOString(),
 candidate: { display_name: "Sofía Rojas" },
 },
];

const DEMO_QUESTS = [
 {
 id: "q1",
 progress: 3,
 quest: {
 title_es: "Responde a 5 candidatos hoy",
 description: "Mejora tu tiempo de respuesta. +50 XP.",
 goal_value: 5,
 xp_reward: 50,
 },
 },
 {
 id: "q2",
 progress: 1,
 quest: {
 title_es: "Da feedback a 3 rechazados",
 description: "Los candidatos lo agradecen y tu empresa sube de bracket.",
 goal_value: 3,
 xp_reward: 60,
 },
 },
 {
 id: "q3",
 progress: 0,
 quest: {
 title_es: "Publica 1 vacante con salario público",
 description: "Transparencia salarial = +bracket.",
 goal_value: 1,
 xp_reward: 30,
 },
 },
];

export default async function RecruiterDashboardPage() {
 const sb = await createClient();

 let recruiter: any = DEMO_RECRUITER;
 let applications: any[] = DEMO_APPLICATIONS;
 let quests: any[] = DEMO_QUESTS;
 let isDemo = true;

 if (sb) {
 const {
 data: { user },
 } = await sb.auth.getUser();
 if (user) {
 const { data: r } = await sb
 .from("recruiters")
 .select("*, company:companies(name,bracket,score)")
 .eq("user_id", user.id)
 .single();
 if (r) {
 recruiter = r;
 const { data: apps } = await sb
 .from("applications")
 .select(
 "id,status,applied_at,responded_at,interview_at,candidate:candidates(display_name,avatar_url)",
 )
 .eq("recruiter_id", r.id)
 .order("applied_at", { ascending: false })
 .limit(20);
 applications = apps || [];
 const { data: q } = await sb
 .from("user_quests")
 .select("*, quest:quests(*)")
 .eq("user_id", user.id)
 .eq("date", new Date().toISOString().slice(0, 10));
 quests = q || [];
 isDemo = false;
 }
 }
 }

 const company = Array.isArray(recruiter.company)
 ? recruiter.company[0]
 : recruiter.company;

 return (
 <>
 <Navbar />
 <main id="main" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 pb-16">
 <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
 <div>
 <h1 className="font-display text-3xl font-bold text-slate-900">
 Hola, {recruiter.display_name || "Reclutador"} 👋
 </h1>
 <p className="text-slate-600">
 {company?.name} · Score actual{" "}
 {Math.round(recruiter.score || 0).toLocaleString()}
 </p>
 </div>
 {isDemo && (
 <Badge variant="warning" className="text-xs">
 Vista demo · datos ficticios
 </Badge>
 )}
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
 <KpiCard
 icon={Users}
 label="Aplicaciones"
 value={applications.length}
 color="from-primary-500 to-violet-600"
 />
 <KpiCard
 icon={Clock}
 label="Tiempo respuesta"
 value={`${Math.round(recruiter.avg_response_time_h || 0)}h`}
 color="from-cta-500 to-orange-600"
 />
 <KpiCard
 icon={Target}
 label="Entrevistas"
 value={recruiter.interviews_held || 0}
 color="from-success-500 to-emerald-600"
 />
 <KpiCard
 icon={CheckCircle2}
 label="Contratados"
 value={recruiter.hires_completed || 0}
 color="from-amber-500 to-yellow-600"
 />
 </div>

 <div className="grid lg:grid-cols-3 gap-6">
 <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-1">
 <div className="flex items-center gap-2 mb-3">
 <Trophy className="size-5 text-amber-500" aria-hidden />
 <h2 className="font-display text-lg font-bold">Tu posición</h2>
 </div>
 <div className="text-center py-4">
 <p className="font-display text-4xl font-bold text-slate-900 mt-3">
 #{recruiter.rank || "—"}
 </p>
 <p className="text-sm text-slate-500">en el ranking nacional</p>
 </div>
 <div className="pt-4 border-t border-slate-100">
 <p className="text-sm font-bold text-slate-900 mb-2">Tu empresa</p>
 <div className="flex items-center justify-between">
 <span className="text-sm text-slate-700">{company?.name}</span>
</div>
 <p className="mt-1 text-xs text-slate-500">
 Score empresa: {Math.round(company?.score || 0).toLocaleString()}
 </p>
 </div>
 <Button asChild variant="outline" className="w-full mt-4">
 <Link href="/leaderboard?tab=recruiters">Ver ranking</Link>
 </Button>
 </div>

 <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
 <div className="flex items-center gap-2 mb-3">
 <Sparkles className="size-5 text-primary-500" aria-hidden />
 <h2 className="font-display text-lg font-bold">Misiones de hoy</h2>
 </div>
 <div className="space-y-3">
 {quests.map((q: any) => {
 const quest = Array.isArray(q.quest) ? q.quest[0] : q.quest;
 if (!quest) return null;
 const pct = Math.min(100, (q.progress / quest.goal_value) * 100);
 return (
 <div key={q.id} className="rounded-xl bg-slate-50 p-4">
 <div className="flex items-center justify-between mb-1.5">
 <p className="font-bold text-slate-900">{quest.title_es}</p>
 <Badge variant="warning" className="shrink-0">
 +{quest.xp_reward} XP
 </Badge>
 </div>
 <p className="text-sm text-slate-600 mb-2">{quest.description}</p>
 <Progress value={pct} className="h-2" />
 <p className="text-xs text-slate-500 mt-1">
 {q.progress} / {quest.goal_value}
 </p>
 </div>
 );
 })}
 {!quests.length && (
 <div className="rounded-xl bg-slate-50 p-6 text-center text-slate-500 text-sm">
 Hoy no hay misiones nuevas. ¡Vuelve mañana!
 </div>
 )}
 </div>
 </div>
 </div>

 <section className="mt-8">
 <h2 className="font-display text-xl font-bold text-slate-900 mb-3">
 Postulaciones recientes
 </h2>
 <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
 <ul className="divide-y divide-slate-100">
 {applications.map((a: any) => {
 const cand = Array.isArray(a.candidate) ? a.candidate[0] : a.candidate;
 return (
 <li key={a.id} className="flex items-center gap-3 p-4">
 <div className="grid size-10 place-items-center rounded-full bg-primary-100 text-primary-700 font-semibold">
 {(cand?.display_name || "?").charAt(0)}
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-bold text-slate-900 truncate">
 {cand?.display_name || "Anónimo"}
 </p>
 <p className="text-xs text-slate-500 truncate">
 Aplicó {new Date(a.applied_at).toLocaleString("es-PA")}
 </p>
 </div>
 <Badge variant={a.status === "rejected" ? "destructive" : "default"}>
 {a.status}
 </Badge>
 </li>
 );
 })}
 {!applications.length && (
 <li className="p-10 text-center text-slate-500">
 Aún no tienes aplicaciones.
 </li>
 )}
 </ul>
 </div>
 </section>
 </main>
 <Footer />
 </>
 );
}

function KpiCard({
 icon: Icon,
 label,
 value,
 color,
}: {
 icon: React.ComponentType<{ className?: string }>;
 label: string;
 value: number | string;
 color: string;
}) {
 return (
 <div className="rounded-2xl border border-slate-200 bg-white p-4">
 <div
 className={`inline-grid size-9 place-items-center rounded-lg bg-gradient-to-br ${color} text-white mb-2`}
 aria-hidden
 >
 <Icon className="size-5" />
 </div>
 <p className="font-display text-2xl font-bold text-slate-900">{value}</p>
 <p className="text-xs text-slate-500">{label}</p>
 </div>
 );
}
