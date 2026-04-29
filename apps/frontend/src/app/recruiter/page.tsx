import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
 CheckCircle2,
 Clock,
 Target,
 Trophy,
 Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { IntakeLinkCard } from "@/components/intake/IntakeLinkCard";
import { LogoutButton } from "@/components/auth/LogoutButton";

export const metadata: Metadata = {
 title: "Dashboard reclutador",
};

type RecruiterRow = {
 id: string;
 display_name: string | null;
 score: number | null;
 rank: number | null;
 avg_response_time_h: number | null;
 interviews_held: number | null;
 hires_completed: number | null;
 company:
  | { name: string | null; bracket: string | null; score: number | null }
  | { name: string | null; bracket: string | null; score: number | null }[]
  | null;
};

type ApplicationRow = {
 id: string;
 status: string;
 applied_at: string;
 candidate:
  | { display_name: string | null; avatar_url: string | null }
  | { display_name: string | null; avatar_url: string | null }[]
  | null;
};

export default async function RecruiterDashboardPage() {
 const sb = await createClient();
 if (!sb) redirect("/login?next=/recruiter");

 const {
  data: { user },
 } = await sb.auth.getUser();
 if (!user) redirect("/login?next=/recruiter");

 const { data: recruiterRow } = await sb
  .from("recruiters")
  .select("*, company:companies(name,bracket,score)")
  .eq("user_id", user.id)
  .maybeSingle();

 if (!recruiterRow) {
  return (
   <>
    <Navbar />
    <main id="main" className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pt-16 pb-16">
     <div className="rounded-2xl border border-amber-300 bg-amber-50 p-8 text-center">
      <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
       Tu cuenta de reclutador todavía no está configurada
      </h1>
      <p className="text-slate-700 mb-4">
       Tu usuario existe pero no hay un perfil de reclutador asociado. Avisa al equipo.
      </p>
      <LogoutButton />
     </div>
    </main>
    <Footer />
   </>
  );
 }

 const recruiter = recruiterRow as RecruiterRow;

 const { data: applications } = await sb
  .from("applications")
  .select(
   "id,status,applied_at,responded_at,interview_at,candidate:candidates(display_name,avatar_url)",
  )
  .eq("recruiter_id", recruiter.id)
  .order("applied_at", { ascending: false })
  .limit(20);

 const apps: ApplicationRow[] = (applications as ApplicationRow[] | null) || [];

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
       {company?.name || "—"} · Score actual{" "}
       {Math.round(recruiter.score || 0).toLocaleString()}
      </p>
     </div>
     <LogoutButton />
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
     <KpiCard
      icon={Users}
      label="Aplicaciones"
      value={apps.length}
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
        <span className="text-sm text-slate-700">{company?.name || "—"}</span>
       </div>
       <p className="mt-1 text-xs text-slate-500">
        Score empresa: {Math.round(company?.score || 0).toLocaleString()}
       </p>
      </div>
      <Button asChild variant="outline" className="w-full mt-4">
       <Link href="/leaderboard">Ver leaderboard</Link>
      </Button>
     </div>

     <section className="lg:col-span-2">
      <h2 className="font-display text-xl font-bold text-slate-900 mb-3">
       Tu link público
      </h2>
      <IntakeLinkCard />
     </section>
    </div>

    <section className="mt-8">
     <h2 className="font-display text-xl font-bold text-slate-900 mb-3">
      Postulaciones recientes
     </h2>
     <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <ul className="divide-y divide-slate-100">
       {apps.map((a) => {
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
       {!apps.length && (
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
