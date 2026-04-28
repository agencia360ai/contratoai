import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, MapPin, Sparkles, Trophy, User as UserIcon } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AchievementCard } from "@/components/game/AchievementCard";
import { createClient } from "@/lib/supabase/server";
import { DEMO_ACHIEVEMENTS, DEMO_PROGRESS } from "@/lib/demo-data";

export const metadata: Metadata = {
 title: "Mi perfil",
};

const DEMO_CANDIDATE = {
 display_name: "Joann Guerra",
 location: "Ciudad de Panamá",
 skills: [
 { name: "react" },
 { name: "typescript" },
 { name: "python" },
 { name: "sql" },
 { name: "lang_en_b2" },
 { name: "communication" },
 { name: "leadership" },
 { name: "figma" },
 ],
};

export default async function ProfilePage() {
 const sb = await createClient();

 let candidate: any = null;
 let progress: any = null;
 let achievements: any[] = [];
 let isDemo = false;

 if (sb) {
 const {
 data: { user },
 } = await sb.auth.getUser();
 if (user) {
 const [{ data: c }, { data: p }, { data: a }] = await Promise.all([
 sb.from("candidates").select("*").eq("user_id", user.id).single(),
 sb.from("user_progress").select("*").eq("user_id", user.id).single(),
 sb
 .from("user_achievements")
 .select("unlocked_at,achievement:achievements(*)")
 .eq("user_id", user.id),
 ]);
 candidate = c;
 progress = p;
 achievements = a || [];
 } else {
 isDemo = true;
 candidate = DEMO_CANDIDATE;
 progress = DEMO_PROGRESS;
 achievements = DEMO_ACHIEVEMENTS.map((ach) => ({
 unlocked_at: ach.unlocked_at,
 achievement: ach,
 }));
 }
 } else {
 isDemo = true;
 candidate = DEMO_CANDIDATE;
 progress = DEMO_PROGRESS;
 achievements = DEMO_ACHIEVEMENTS.map((ach) => ({
 unlocked_at: ach.unlocked_at,
 achievement: ach,
 }));
 }

 return (
 <>
 <Navbar />
 <main id="main" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 pb-16">
 {isDemo && (
 <Badge variant="warning" className="mb-4 text-xs">
 Vista demo · datos ficticios
 </Badge>
 )}

 <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm mb-6">
 <div className="flex flex-col sm:flex-row gap-5 items-start">
 <div className="grid size-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-500 to-violet-600 text-white text-3xl font-bold">
 {(candidate?.display_name || "?").charAt(0)}
 </div>
 <div className="flex-1 min-w-0">
 <h1 className="font-display text-2xl font-bold text-slate-900">
 {candidate?.display_name || "Sin nombre"}
 </h1>
 <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
 {candidate?.location && (
 <span className="flex items-center gap-1.5">
 <MapPin className="size-4 text-slate-400" />
 {candidate.location}
 </span>
 )}
 <span className="flex items-center gap-1.5">
 <Briefcase className="size-4 text-slate-400" />
 {progress?.applications_sent || 0} postulaciones · {progress?.interviews || 0} entrevistas
 </span>
 </div>
 <div className="mt-3 flex flex-wrap gap-2">
 {(candidate?.skills as { name: string }[] | null)
 ?.slice(0, 8)
 .map((s) => (
 <Badge key={s.name} variant="default">
 {s.name}
 </Badge>
 ))}
 </div>
 </div>
 <Button variant="outline" asChild>
 <Link href="/profile/edit">Editar</Link>
 </Button>
 </div>
 </div>

 <section className="mb-8">
 <h2 className="font-display text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
 <Trophy className="size-5 text-amber-500" aria-hidden />
 Logros
 </h2>
 <div className="grid gap-3 md:grid-cols-2">
 {(achievements || []).map((a: any, i: number) => {
 const ach = Array.isArray(a.achievement) ? a.achievement[0] : a.achievement;
 if (!ach) return null;
 return (
 <AchievementCard
 key={ach.id || ach.slug || i}
 name={ach.name_es}
 description={ach.description}
 icon={ach.icon || "Trophy"}
 tier={ach.tier as any}
 unlocked={Boolean(a.unlocked_at || ach.unlocked_at)}
 unlockedAt={a.unlocked_at}
 xpReward={ach.xp_reward}
 />
 );
 })}
 {!achievements?.length && (
 <p className="col-span-full text-slate-500 text-center py-6">
 Aún no has desbloqueado logros. ¡Aplica a tu primer trabajo!
 </p>
 )}
 </div>
 </section>

 <section>
 <h2 className="font-display text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
 <Sparkles className="size-5 text-primary-500" aria-hidden />
 Sigue ganando XP
 </h2>
 <div className="grid gap-3 md:grid-cols-3">
 <Link
 href="/jobs"
 className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow cursor-pointer"
 >
 <p className="font-bold text-slate-900">Aplica a un trabajo</p>
 <p className="text-sm text-slate-600 mt-1">+10 XP por aplicación</p>
 </Link>
 <Link
 href="/profile/skills"
 className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow cursor-pointer"
 >
 <p className="font-bold text-slate-900">Valida una habilidad</p>
 <p className="text-sm text-slate-600 mt-1">+50 XP por test pasado</p>
 </Link>
 <Link
 href="/leaderboard"
 className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow cursor-pointer"
 >
 <p className="font-bold text-slate-900">Sigue tus empresas top</p>
 <p className="text-sm text-slate-600 mt-1">+5 XP cada día activo</p>
 </Link>
 </div>
 </section>
 </main>
 <Footer />
 </>
 );
}
