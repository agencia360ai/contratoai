import type { Metadata } from "next";
import Link from "next/link";
import {
 Search,
 Filter,
 TrendingUp,
 Sparkles,
 ArrowRight,
 X,
 MapPin,
 Briefcase,
 Building2,
 DollarSign,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/jobs/JobCard";
import { createClient } from "@/lib/supabase/server";
import { DEMO_JOBS } from "@/lib/demo-data";

export const metadata: Metadata = {
 title: "Trabajos en Panamá",
 description: "Más de 1,000 vacantes reales scrapeadas de 4 fuentes. Filtradas por IA.",
};

export const revalidate = 300;

const PAGE_SIZE = 30;

export default async function JobsPage({
 searchParams,
}: {
 searchParams: Promise<{
 q?: string;
 modality?: string;
 level?: string;
 sort?: string;
 page?: string;
 }>;
}) {
 const params = await searchParams;
 const sb = await createClient();
 const page = Math.max(1, parseInt(params.page || "1", 10));
 const offset = (page - 1) * PAGE_SIZE;

 let jobs: any[] = [];
 let totalCount = 0;
 let isDemo = false;

 if (sb) {
 let countQ = sb.from("jobs_active_v").select("id", { count: "exact", head: true });
 let dataQ = sb
 .from("jobs_active_v")
 .select(
 "id,title,company_name,location,salary_min,salary_max,salary_currency,modality,experience_level,industry,posted_at,scraped_at,skills_extracted",
 )
 .range(offset, offset + PAGE_SIZE - 1);

 if (params.q) {
 countQ = countQ.ilike("title", `%${params.q}%`);
 dataQ = dataQ.ilike("title", `%${params.q}%`);
 }
 if (params.modality && ["onsite", "remote", "hybrid"].includes(params.modality)) {
 countQ = countQ.eq("modality", params.modality);
 dataQ = dataQ.eq("modality", params.modality);
 }
 if (params.level) {
 countQ = countQ.eq("experience_level", params.level);
 dataQ = dataQ.eq("experience_level", params.level);
 }

 // Sort
 const sort = params.sort || "recent";
 if (sort === "salary") {
 dataQ = dataQ.order("salary_max", { ascending: false, nullsFirst: false });
 } else if (sort === "salary_low") {
 dataQ = dataQ.order("salary_min", { ascending: true, nullsFirst: false });
 } else {
 dataQ = dataQ.order("scraped_at", { ascending: false });
 }

 const [{ data, error: dataErr }, { count }] = await Promise.all([dataQ, countQ]);
 jobs = data || [];
 totalCount = count || 0;
 } else {
 isDemo = true;
 jobs = DEMO_JOBS.filter((j) => {
 if (params.q && !j.title.toLowerCase().includes(params.q.toLowerCase())) return false;
 if (params.modality && j.modality !== params.modality) return false;
 if (params.level && j.experience_level !== params.level) return false;
 return true;
 });
 totalCount = jobs.length;
 }

 const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
 const buildHref = (overrides: Record<string, string | undefined>) => {
 const next = { ...params, ...overrides, page: overrides.page ?? "1" };
 const sp = Object.entries(next)
 .filter(([_, v]) => v && v !== "")
 .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
 .join("&");
 return `/jobs${sp ? "?" + sp : ""}`;
 };

 const activeFilters = [
 params.q && { key: "q", label: `"${params.q}"`, href: buildHref({ q: undefined }) },
 params.modality && {
 key: "modality",
 label:
 params.modality === "remote"
 ? "Remoto"
 : params.modality === "hybrid"
 ? "Híbrido"
 : "Presencial",
 href: buildHref({ modality: undefined }),
 },
 params.level && {
 key: "level",
 label: params.level,
 href: buildHref({ level: undefined }),
 },
 ].filter(Boolean) as { key: string; label: string; href: string }[];

 return (
 <>
 <Navbar />
 <main id="main" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-16">
 {/* Header — punchy */}
 <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
 <div>
 <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 tracking-tighter">
 {totalCount.toLocaleString()} trabajos.{" "}
 <span className="text-gradient-gold">Solo los reales.</span>
 </h1>
 <p className="mt-2 text-slate-600 text-lg">
 Crea tu perfil para que la plataforma filtre{" "}
 <strong className="text-slate-700">solo los que importan</strong>.
 </p>
 </div>
 {isDemo && (
 <Badge variant="warning" className="text-xs">
 Vista demo
 </Badge>
 )}
 </div>

 {/* CTA banner — get personalized matches */}
 <div className="mb-6 rounded-2xl border border-gold-300 bg-gradient-to-r from-gold-50 to-amber-50/60 p-4 flex items-center justify-between gap-3 flex-wrap">
 <div className="flex items-center gap-3">
 <div className="grid size-10 place-items-center rounded-xl bg-gold-500 text-white shrink-0">
 <Sparkles className="size-5" />
 </div>
 <div>
 <p className="font-bold text-slate-900">
 ¿Y si en lugar de buscar, los trabajos te buscan a ti?
 </p>
 <p className="text-sm text-slate-700">
 5 minutos con DISC + Brújula = matches personalizados todos los días.
 </p>
 </div>
 </div>
 <Button asChild size="default">
 <Link href="/onboarding">
 Crear perfil gratis
 <ArrowRight className="size-4" />
 </Link>
 </Button>
 </div>

 {/* Search bar */}
 <form action="/jobs" className="flex flex-col sm:flex-row gap-2 mb-4">
 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" aria-hidden />
 <Input
 name="q"
 placeholder="¿Qué buscas? 'desarrollador', 'cajero bilingüe', 'analista'..."
 defaultValue={params.q || ""}
 className="pl-11 h-12"
 />
 </div>
 {/* preserve other filters when searching */}
 {params.modality && <input type="hidden" name="modality" value={params.modality} />}
 {params.level && <input type="hidden" name="level" value={params.level} />}
 {params.sort && <input type="hidden" name="sort" value={params.sort} />}
 <Button type="submit" size="default" className="sm:w-auto h-12 px-6">
 Buscar
 </Button>
 </form>

 {/* Active filters pills */}
 {activeFilters.length > 0 && (
 <div className="mb-4 flex flex-wrap items-center gap-2">
 <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
 Filtros activos:
 </span>
 {activeFilters.map((f) => (
 <Link
 key={f.key}
 href={f.href}
 className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
 >
 {f.label}
 <X className="size-3" />
 </Link>
 ))}
 <Link
 href="/jobs"
 className="text-xs text-slate-600 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
 >
 Limpiar todos
 </Link>
 </div>
 )}

 {/* Layout: filters sidebar + main results */}
 <div className="grid lg:grid-cols-[280px_1fr] gap-6">
 {/* Sidebar */}
 <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
 <FilterGroup
 title="Modalidad"
 icon={Briefcase}
 options={[
 { label: "Todas", href: buildHref({ modality: undefined }), active: !params.modality },
 { label: "Remoto", href: buildHref({ modality: "remote" }), active: params.modality === "remote" },
 { label: "Híbrido", href: buildHref({ modality: "hybrid" }), active: params.modality === "hybrid" },
 { label: "Presencial", href: buildHref({ modality: "onsite" }), active: params.modality === "onsite" },
 ]}
 />

 <FilterGroup
 title="Nivel"
 icon={TrendingUp}
 options={[
 { label: "Todos", href: buildHref({ level: undefined }), active: !params.level },
 { label: "Pasante", href: buildHref({ level: "intern" }), active: params.level === "intern" },
 { label: "Junior", href: buildHref({ level: "junior" }), active: params.level === "junior" },
 { label: "Mid", href: buildHref({ level: "mid" }), active: params.level === "mid" },
 { label: "Senior", href: buildHref({ level: "senior" }), active: params.level === "senior" },
 { label: "Lead", href: buildHref({ level: "lead" }), active: params.level === "lead" },
 { label: "Exec", href: buildHref({ level: "exec" }), active: params.level === "exec" },
 ]}
 />

 <FilterGroup
 title="Ordenar"
 icon={Filter}
 options={[
 { label: "Más recientes", href: buildHref({ sort: undefined }), active: !params.sort || params.sort === "recent" },
 { label: "Mayor salario", href: buildHref({ sort: "salary" }), active: params.sort === "salary" },
 { label: "Empezando carrera", href: buildHref({ sort: "salary_low" }), active: params.sort === "salary_low" },
 ]}
 />
 </aside>

 {/* Results */}
 <div>
 <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
 <span>
 Mostrando{" "}
 <strong className="text-slate-900">{jobs.length}</strong> de{" "}
 <strong className="text-slate-900">{totalCount.toLocaleString()}</strong>
 </span>
 <span className="font-mono text-xs text-slate-500">
 Página {page} de {totalPages}
 </span>
 </div>

 <div className="grid gap-3">
 {jobs.map((j: any) => (
 <JobCard
 key={j.id}
 id={j.id}
 title={j.title}
 company={j.company_name || "Empresa anónima"}
  location={j.location}
 salaryMin={j.salary_min}
 salaryMax={j.salary_max}
 salaryCurrency={j.salary_currency}
 modality={j.modality}
 experienceLevel={j.experience_level}
 postedAt={j.posted_at || j.scraped_at}
 skills={j.skills_extracted}
 industry={j.industry}
 />
 ))}
 {!jobs.length && (
 <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
 <Search className="mx-auto size-10 text-slate-400 mb-3" aria-hidden />
 <p className="text-lg font-bold text-slate-900">
 No encontramos vacantes así.
 </p>
 <p className="mt-1 text-slate-600 mb-4">
 Prueba quitando algún filtro o buscando otra palabra.
 </p>
 <Button asChild>
 <Link href="/jobs">Ver todos</Link>
 </Button>
 </div>
 )}
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="mt-8 flex items-center justify-center gap-2">
 {page > 1 && (
 <Button asChild variant="secondary" size="sm">
 <Link href={buildHref({ page: String(page - 1) })}>← Anterior</Link>
 </Button>
 )}
 <span className="px-3 py-2 text-sm font-mono text-slate-600">
 {page} / {totalPages}
 </span>
 {page < totalPages && (
 <Button asChild variant="secondary" size="sm">
 <Link href={buildHref({ page: String(page + 1) })}>Siguiente →</Link>
 </Button>
 )}
 </div>
 )}
 </div>
 </div>
 </main>
 <Footer />
 </>
 );
}

function FilterGroup({
 title,
 icon: Icon,
 options,
}: {
 title: string;
 icon: React.ComponentType<{ className?: string }>;
 options: { label: string; href: string; active: boolean }[];
}) {
 return (
 <div className="rounded-2xl border border-slate-200 bg-white p-4">
 <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
 <Icon className="size-4 text-slate-500" aria-hidden />
 <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wide">
 {title}
 </h3>
 </div>
 <ul className="space-y-1">
 {options.map((o) => (
 <li key={o.label}>
 <Link
 href={o.href}
 className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
 o.active
 ? "bg-slate-900 text-white"
 : "text-slate-700 hover:bg-slate-100"
 }`}
 >
 {o.label}
 </Link>
 </li>
 ))}
 </ul>
 </div>
 );
}
