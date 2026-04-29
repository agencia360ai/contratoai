import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Users, Trophy, Medal } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { getAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
 title: "Leaderboard de reclutadores",
 description:
  "Ranking de reclutadores por vacantes traídas y candidatos agregados.",
};

export const dynamic = "force-dynamic";
export const revalidate = 60;

type Tab = "jobs" | "candidates";

type LinkRow = {
 id: string;
 slug: string;
 display_name: string | null;
 display_company: string | null;
 display_avatar: string | null;
 jobs_published: number | null;
 candidates_added: number | null;
 recruiter:
  | {
     display_name: string | null;
     avatar_url: string | null;
     company: { name: string | null; logo_url: string | null } | null;
    }
  | null;
};

async function loadLeaderboard(tab: Tab): Promise<LinkRow[]> {
 const sb = getAdminClient();
 const orderCol = tab === "jobs" ? "jobs_published" : "candidates_added";
 const { data, error } = await sb
  .from("recruiter_intake_links")
  .select(
   "id, slug, display_name, display_company, display_avatar, jobs_published, candidates_added, recruiter:recruiters(display_name, avatar_url, company:companies(name, logo_url))",
  )
  .eq("is_active", true)
  .order(orderCol, { ascending: false, nullsFirst: false })
  .limit(50);
 if (error) {
  console.error("[leaderboard] query error:", error.message);
  return [];
 }
 return (data || []).map((row) => {
  const r = row as unknown as LinkRow & {
   recruiter:
    | LinkRow["recruiter"]
    | LinkRow["recruiter"][]
    | null;
  };
  const rec = Array.isArray(r.recruiter) ? r.recruiter[0] : r.recruiter;
  return { ...r, recruiter: rec || null } as LinkRow;
 });
}

export default async function LeaderboardPage({
 searchParams,
}: {
 searchParams: Promise<{ tab?: string }>;
}) {
 const sp = await searchParams;
 const tab: Tab = sp.tab === "candidates" ? "candidates" : "jobs";
 const rows = await loadLeaderboard(tab);

 return (
  <>
   <Navbar />
   <main
    id="main"
    className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 pb-16"
   >
    <header className="mb-6">
     <div className="flex items-center gap-2 text-amber-600 mb-2">
      <Trophy className="size-5" />
      <span className="text-xs font-mono uppercase tracking-wider font-bold">
       Leaderboard
      </span>
     </div>
     <h1 className="font-display text-3xl font-bold text-slate-900">
      Top reclutadores
     </h1>
     <p className="text-slate-600 mt-1">
      Ranking de quienes traen más{" "}
      {tab === "jobs" ? "vacantes" : "candidatos"} a la plataforma vía sus
      links públicos.
     </p>
    </header>

    <div className="flex gap-2 mb-6 border-b border-slate-200">
     <TabLink label="Vacantes traídas" href="/leaderboard?tab=jobs" active={tab === "jobs"} icon={Briefcase} />
     <TabLink label="Candidatos traídos" href="/leaderboard?tab=candidates" active={tab === "candidates"} icon={Users} />
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
     {rows.length === 0 ? (
      <div className="p-12 text-center text-slate-500">
       Aún no hay datos para mostrar. Los reclutadores aparecen acá apenas
       reciben su primera{" "}
       {tab === "jobs" ? "vacante" : "candidato"} vía su link público.
      </div>
     ) : (
      <ol className="divide-y divide-slate-100">
       {rows.map((row, i) => {
        const rank = i + 1;
        const value =
         tab === "jobs" ? row.jobs_published || 0 : row.candidates_added || 0;
        const name =
         row.recruiter?.display_name ||
         row.display_name ||
         "Reclutador";
        const company =
         row.recruiter?.company?.name ||
         row.display_company ||
         null;
        const avatar = row.recruiter?.avatar_url || row.display_avatar;
        return (
         <li
          key={row.id}
          className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
         >
          <RankBadge rank={rank} />
          <div className="grid size-11 place-items-center rounded-full bg-primary-100 text-primary-700 font-semibold overflow-hidden shrink-0">
           {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="size-full object-cover" />
           ) : (
            name.charAt(0).toUpperCase()
           )}
          </div>
          <div className="flex-1 min-w-0">
           <p className="font-bold text-slate-900 truncate">{name}</p>
           <p className="text-xs text-slate-500 truncate">
            {company || "Independiente"}
           </p>
          </div>
          <div className="text-right shrink-0">
           <p className="font-display text-2xl font-bold text-slate-900 leading-none">
            {value.toLocaleString()}
           </p>
           <p className="text-xs text-slate-500 mt-0.5">
            {tab === "jobs" ? "vacantes" : "candidatos"}
           </p>
          </div>
         </li>
        );
       })}
      </ol>
     )}
    </div>

    <p className="mt-6 text-center text-xs text-slate-500">
     Actualizado al momento. Los contadores suben cuando alguien confirma una
     vacante o un CV vía un link público <code>/r/&lt;slug&gt;</code> o{" "}
     <code>/c/&lt;slug&gt;</code>.
    </p>

    <div className="mt-8 flex justify-center">
     <Button asChild variant="outline">
      <Link href="/recruiter">Ir a mi dashboard</Link>
     </Button>
    </div>
   </main>
   <Footer />
  </>
 );
}

function TabLink({
 label,
 href,
 active,
 icon: Icon,
}: {
 label: string;
 href: string;
 active: boolean;
 icon: React.ComponentType<{ className?: string }>;
}) {
 return (
  <Link
   href={href}
   className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
    active
     ? "border-primary-500 text-primary-700"
     : "border-transparent text-slate-500 hover:text-slate-900"
   }`}
  >
   <Icon className="size-4" />
   {label}
  </Link>
 );
}

function RankBadge({ rank }: { rank: number }) {
 if (rank === 1)
  return (
   <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-white shrink-0 shadow-md">
    <Medal className="size-4" />
   </div>
  );
 if (rank === 2)
  return (
   <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-white shrink-0 shadow-sm">
    <Medal className="size-4" />
   </div>
  );
 if (rank === 3)
  return (
   <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-orange-700 text-white shrink-0 shadow-sm">
    <Medal className="size-4" />
   </div>
  );
 return (
  <div className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500 font-mono font-bold text-sm shrink-0">
   {rank}
  </div>
 );
}
