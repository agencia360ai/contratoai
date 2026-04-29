import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  MapPin,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/jobs/JobCard";
import { createClient } from "@/lib/supabase/server";
import type { Modality } from "@/lib/types";

export const revalidate = 300;

type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  size: string | null;
  location: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  is_claimed: boolean;
  claimed_at: string | null;
  created_at: string | null;
};

type JobRow = {
  id: string;
  title: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  modality: Modality | null;
  experience_level: string | null;
  industry: string | null;
  posted_at: string | null;
  scraped_at: string | null;
  source: string;
  skills_extracted: string[] | null;
};

async function loadCompany(slug: string): Promise<{
  company: CompanyRow;
  jobs: JobRow[];
} | null> {
  const sb = await createClient();
  if (!sb) return null;

  const { data: company } = await sb
    .from("companies")
    .select(
      "id, name, slug, industry, size, location, website, description, logo_url, is_claimed, claimed_at, created_at",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (!company) return null;

  const { data: jobs } = await sb
    .from("jobs_active_v")
    .select(
      "id,title,location,salary_min,salary_max,salary_currency,modality,experience_level,industry,posted_at,scraped_at,source,skills_extracted",
    )
    .eq("company_id", company.id)
    .order("posted_at", { ascending: false, nullsFirst: false })
    .limit(50);

  return {
    company: company as CompanyRow,
    jobs: (jobs as JobRow[]) || [],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadCompany(slug);
  if (!data) return { title: "Empresa no encontrada" };
  const { company, jobs } = data;
  return {
    title: `${company.name} — empleos en Panamá${jobs.length ? ` (${jobs.length} vacantes activas)` : ""}`,
    description: company.description
      ? company.description.slice(0, 160)
      : `Perfil público de ${company.name}${company.location ? ` en ${company.location}` : ""}. Vacantes scrapeadas de fuentes oficiales y agregadas por TeContrato Panamá.`,
  };
}

const SOURCE_LABELS: Record<string, string> = {
  konzerta_pa: "Konzerta",
  encuentra24_pa: "Encuentra24",
  computrabajo_pa: "Computrabajo",
  acp_pa: "Canal de Panamá",
  mitradel_pa: "MITRADEL",
  ciudad_del_saber: "Ciudad del Saber",
  jobspy_indeed: "Indeed",
  jobspy_linkedin: "LinkedIn",
  hiring_room: "Hiring Room",
  workday: "Workday",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "·";
}

function hostname(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadCompany(slug);
  if (!data) notFound();
  const { company, jobs } = data;

  const sources = Array.from(new Set(jobs.map((j) => j.source)));
  const lastPosted = jobs[0]?.posted_at || jobs[0]?.scraped_at || null;
  const website = company.website;
  const websiteHost = hostname(website);

  return (
    <>
      <Navbar />
      <main id="main" className="min-h-screen">
        {/* HEADER */}
        <section className="relative pt-12 pb-10 border-b border-slate-200">
          <div className="absolute inset-0 bg-grid-light opacity-60" aria-hidden />
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/empresas/directorio"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6"
            >
              ← Directorio de empresas
            </Link>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Logo / initials */}
              {company.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logo_url}
                  alt={`Logo de ${company.name}`}
                  className="size-20 rounded-2xl object-cover ring-2 ring-white shadow-sm bg-white"
                />
              ) : (
                <div className="grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold-300 via-gold-400 to-amber-600 text-white font-display font-bold text-3xl shadow-sm ring-2 ring-white">
                  {initials(company.name)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  {company.is_claimed ? (
                    <Badge variant="success">
                      <ShieldCheck className="size-3" /> Verificada
                    </Badge>
                  ) : (
                    <Badge variant="default">Sin reclamar</Badge>
                  )}
                  {company.industry && <Badge variant="default">{company.industry}</Badge>}
                  {company.size && <Badge variant="default">{company.size}</Badge>}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
                  {company.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                  {company.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4 text-slate-400" /> {company.location}
                    </span>
                  )}
                  {websiteHost && (
                    <a
                      href={website?.startsWith("http") ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800"
                    >
                      <Globe className="size-4" /> {websiteHost}{" "}
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {company.description && (
              <p className="mt-6 text-slate-700 leading-relaxed max-w-3xl">
                {company.description}
              </p>
            )}

            {/* Stats strip */}
            <div className="mt-7 grid grid-cols-3 gap-3 max-w-xl">
              <Stat label="vacantes activas" value={String(jobs.length)} highlight />
              <Stat label="fuentes" value={String(sources.length)} />
              <Stat
                label="última vacante"
                value={
                  lastPosted
                    ? new Date(lastPosted).toLocaleDateString("es-PA", {
                        day: "numeric",
                        month: "short",
                      })
                    : "—"
                }
              />
            </div>
          </div>
        </section>

        {/* CLAIM BANNER */}
        {!company.is_claimed && (
          <section className="border-b border-slate-200 bg-gradient-to-br from-amber-50 to-amber-100/40">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-200/60 text-amber-700">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900 leading-tight">
                    ¿Eres parte del equipo de {company.name}?
                  </p>
                  <p className="text-sm text-slate-700 mt-0.5">
                    Reclama el perfil para responder candidatos, agregar logo y publicar nuevas
                    vacantes directamente.
                  </p>
                </div>
              </div>
              <Button
                asChild
                size="lg"
                variant="gold"
                className="w-full sm:w-auto shrink-0"
              >
                <Link href={`/login?claim=${company.slug}`}>
                  Reclamar perfil <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </section>
        )}

        {/* JOBS */}
        <section className="py-10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-3 mb-5">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Vacantes activas
              </h2>
              {sources.length > 0 && (
                <div className="hidden sm:flex flex-wrap gap-1.5 max-w-md justify-end">
                  {sources.map((s) => (
                    <Badge key={s} variant="default" className="text-[10px]">
                      {SOURCE_LABELS[s] || s}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {jobs.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <Briefcase className="mx-auto size-10 text-slate-300 mb-3" />
                <p className="text-slate-700 font-semibold">
                  No hay vacantes activas en este momento.
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Vuelve pronto — actualizamos diariamente desde fuentes oficiales.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((j) => (
                  <JobCard
                    key={j.id}
                    id={j.id}
                    title={j.title}
                    company={company.name}
                    location={j.location}
                    salaryMin={j.salary_min}
                    salaryMax={j.salary_max}
                    salaryCurrency={j.salary_currency}
                    modality={j.modality}
                    experienceLevel={j.experience_level}
                    postedAt={j.posted_at || j.scraped_at}
                    skills={Array.isArray(j.skills_extracted) ? j.skills_extracted : []}
                    industry={j.industry}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FOOTER NOTE */}
        <section className="border-t border-slate-200 bg-slate-50/50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              <Building2 className="inline size-3.5 mr-1 -mt-0.5" />
              Perfil público generado a partir de vacantes scrapeadas en fuentes oficiales.
              {!company.is_claimed && " La empresa aún no es miembro de TeContrato Panamá."}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 text-center ${
        highlight
          ? "border-gold-300 bg-gradient-to-br from-gold-50 to-white"
          : "border-slate-200 bg-white"
      }`}
    >
      <p
        className={`font-display font-bold text-2xl ${
          highlight ? "text-gradient-gold" : "text-slate-900"
        }`}
      >
        {value}
      </p>
      <p className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-500 mt-0.5">
        {label}
      </p>
    </div>
  );
}
