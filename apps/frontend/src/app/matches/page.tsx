import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/jobs/JobCard";
import { createClient } from "@/lib/supabase/server";
import { DEMO_MATCHES, DEMO_PROGRESS } from "@/lib/demo-data";

export const metadata: Metadata = {
 title: "Mis matches",
};

export default async function MatchesPage() {
 const sb = await createClient();

 let matches: any[] = [];
 let progress: any = null;
 let isDemo = false;

 if (sb) {
 const {
 data: { user },
 } = await sb.auth.getUser();

 if (user) {
 const { data: candidate } = await sb
 .from("candidates")
 .select("id")
 .eq("user_id", user.id)
 .single();
 const { data: prog } = await sb
 .from("user_progress")
 .select("total_xp,level,bracket,current_streak")
 .eq("user_id", user.id)
 .single();
 progress = prog;
 const { data } = await sb
 .from("matches")
 .select(
 "id,score,scores,explanation,is_seen,is_liked,job:jobs(id,title,location,salary_min,salary_max,salary_currency,modality,posted_at,skills_extracted,company:companies(name,bracket))",
 )
 .eq("candidate_id", candidate?.id || "")
 .order("score", { ascending: false })
 .limit(20);
 matches = data || [];
 } else {
 isDemo = true;
 matches = DEMO_MATCHES;
 progress = DEMO_PROGRESS;
 }
 } else {
 isDemo = true;
 matches = DEMO_MATCHES;
 progress = DEMO_PROGRESS;
 }

 return (
 <>
 <Navbar />
 <main id="main" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 pb-16">
 <div className="mb-8 flex items-start justify-between gap-3 flex-wrap">
 <div>
 <h1 className="font-display text-3xl font-bold text-slate-900 flex items-center gap-2">
 <Sparkles className="size-7 text-primary-500" aria-hidden />
 Mis matches
 </h1>
 <p className="mt-2 text-slate-600">
 Ordenados por compatibilidad. Moni actualiza esto cada noche.
 </p>
 </div>
 {isDemo && (
 <Badge variant="warning" className="text-xs">
 Vista demo · datos ficticios
 </Badge>
 )}
 </div>

 <div className="grid gap-4">
 {matches.map((m: any) => {
 const j = Array.isArray(m.job) ? m.job[0] : m.job;
 const c = j?.company
 ? Array.isArray(j.company)
 ? j.company[0]
 : j.company
 : null;
 return (
 <JobCard
 key={m.id}
 id={j?.id}
 title={j?.title}
 company={c?.name || j?.company_name || "Empresa confidencial"}
  location={j?.location}
 salaryMin={j?.salary_min}
 salaryMax={j?.salary_max}
 salaryCurrency={j?.salary_currency}
 modality={j?.modality}
 postedAt={j?.posted_at}
 skills={j?.skills_extracted}
 matchScore={m.score}
 matchExplanation={m.explanation}
 />
 );
 })}

 {!matches.length && (
 <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
 <Sparkles className="mx-auto size-10 text-primary-500 mb-3" aria-hidden />
 <p className="text-lg font-bold text-slate-700">Aún no tienes matches</p>
 <p className="mt-1 text-slate-600 mb-4">
 Moni está buscando los mejores trabajos para ti. Revisa en unos minutos.
 </p>
 <Button asChild>
 <Link href="/jobs">Ver todos los trabajos</Link>
 </Button>
 </div>
 )}
 </div>
 </main>
 <Footer />
 </>
 );
}
