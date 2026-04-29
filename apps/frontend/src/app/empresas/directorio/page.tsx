import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Search,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Directorio de empresas en Panamá",
  description:
    "Empresas que están contratando en Panamá. Cada perfil incluye sus vacantes activas agregadas de fuentes oficiales.",
};

export const revalidate = 600;

const PAGE_SIZE = 30;

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  location: string | null;
  logo_url: string | null;
  is_claimed: boolean;
  active_jobs: number;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "·";
}

async function loadCompanies(query: string, page: number): Promise<{
  rows: CompanyRow[];
  total: number;
}> {
  const sb = await createClient();
  if (!sb) return { rows: [], total: 0 };

  // Get all companies with active job counts via two queries (kept simple for MVP)
  let companyQ = sb
    .from("companies")
    .select("id, name, slug, industry, location, logo_url, is_claimed", {
      count: "exact",
    })
    .order("is_claimed", { ascending: false })
    .order("name", { ascending: true });

  if (query.trim()) {
    companyQ = companyQ.ilike("name", `%${query.trim()}%`);
  }

  const offset = (page - 1) * PAGE_SIZE;
  const { data: companies, count } = await companyQ.range(offset, offset + PAGE_SIZE - 1);
  if (!companies || companies.length === 0) return { rows: [], total: count || 0 };

  const ids = companies.map((c) => c.id as string);
  const { data: jobsActive } = await sb
    .from("jobs_active_v")
    .select("company_id")
    .in("company_id", ids);

  const counts = new Map<string, number>();
  for (const j of jobsActive || []) {
    const cid = (j as { company_id: string | null }).company_id;
    if (!cid) continue;
    counts.set(cid, (counts.get(cid) || 0) + 1);
  }

  const rows: CompanyRow[] = (companies as Omit<CompanyRow, "active_jobs">[]).map((c) => ({
    ...c,
    active_jobs: counts.get(c.id) || 0,
  }));

  rows.sort((a, b) => {
    if (a.is_claimed !== b.is_claimed) return a.is_claimed ? -1 : 1;
    if (a.active_jobs !== b.active_jobs) return b.active_jobs - a.active_jobs;
    return a.name.localeCompare(b.name);
  });

  return { rows, total: count || rows.length };
}

export default async function CompanyDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q || "").trim();
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const { rows, total } = await loadCompanies(query, page);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <Navbar />
      <main id="main">
        <section className="relative pt-16 pb-10 border-b border-slate-200">
          <div className="absolute inset-0 bg-grid-light opacity-60" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Badge variant="default" className="mb-4">
              <Building2 className="size-3" /> Directorio
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
              Empresas que <span className="text-gradient-gold">están contratando</span>
            </h1>
            <p className="mt-3 text-base md:text-lg text-slate-600 max-w-2xl">
              Perfiles públicos generados a partir de vacantes scrapeadas en fuentes oficiales
              panameñas. Cada empresa tiene su lista de vacantes activas.
            </p>

            <form
              action="/empresas/directorio"
              method="get"
              className="mt-6 flex items-center gap-2 max-w-xl"
            >
              <div className="flex-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white shadow-sm px-3 focus-within:border-slate-400 focus-within:shadow-md transition-all">
                <Search className="size-4 text-slate-400" />
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Buscar empresa…"
                  className="flex-1 min-w-0 bg-transparent border-0 outline-none px-1 py-3 text-base text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="grid h-12 px-5 place-items-center rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
              >
                Buscar
              </button>
            </form>

            <p className="mt-4 text-xs font-mono uppercase tracking-wider text-slate-500">
              {total} {total === 1 ? "empresa" : "empresas"}
              {query ? ` que coinciden con "${query}"` : ""}
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {rows.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <Building2 className="mx-auto size-10 text-slate-300 mb-3" />
                <p className="text-slate-700 font-semibold">
                  {query ? "Sin resultados para tu búsqueda." : "No hay empresas todavía."}
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rows.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/empresa/${c.slug}`}
                      className="group block rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {c.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.logo_url}
                            alt=""
                            className="size-12 rounded-xl object-cover ring-1 ring-slate-200 bg-white shrink-0"
                          />
                        ) : (
                          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold-300 via-gold-400 to-amber-600 text-white font-display font-bold text-base shadow-sm">
                            {initials(c.name)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 leading-tight truncate group-hover:text-gold-700 transition-colors">
                            {c.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {[c.industry, c.location].filter(Boolean).join(" · ") || "Empresa panameña"}
                          </p>
                        </div>
                        {c.is_claimed && (
                          <ShieldCheck className="size-4 text-emerald-600 shrink-0" aria-label="Verificada" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">
                          <span className="font-bold text-slate-900">{c.active_jobs}</span>{" "}
                          {c.active_jobs === 1 ? "vacante activa" : "vacantes activas"}
                        </span>
                        <span className="text-gold-700 font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Ver perfil <ArrowRight className="size-3.5" />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-2">
                <PageLink page={page - 1} disabled={page <= 1} q={query}>
                  <ChevronLeft className="size-4" /> Anterior
                </PageLink>
                <span className="text-sm font-mono text-slate-500 px-3">
                  {page} / {totalPages}
                </span>
                <PageLink page={page + 1} disabled={page >= totalPages} q={query}>
                  Siguiente <ChevronRight className="size-4" />
                </PageLink>
              </nav>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function PageLink({
  page,
  disabled,
  q,
  children,
}: {
  page: number;
  disabled: boolean;
  q: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 cursor-not-allowed">
        {children}
      </span>
    );
  }
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return (
    <Link
      href={`/empresas/directorio${qs ? `?${qs}` : ""}`}
      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
    >
      {children}
    </Link>
  );
}
