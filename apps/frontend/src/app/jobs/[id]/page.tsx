import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
 Building2,
 MapPin,
 Clock,
 DollarSign,
 ExternalLink,
 Briefcase,
 Heart,
 Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { DEMO_JOBS } from "@/lib/demo-data";
import { formatSalary, relativeTime } from "@/lib/utils";

export const revalidate = 300;

async function getJob(id: string) {
 const sb = await createClient();
 if (!sb) {
 return DEMO_JOBS.find((j) => j.id === id) || null;
 }
 const { data } = await sb.from("jobs_active_v").select("*").eq("id", id).single();
 return data;
}

export async function generateMetadata({
 params,
}: {
 params: Promise<{ id: string }>;
}): Promise<Metadata> {
 const { id } = await params;
 const job = await getJob(id);
 if (!job) return { title: "Trabajo" };
 return {
 title: `${job.title} en ${job.company_name}`,
 description: `Vacante de ${job.title} disponible en ${job.company_name}, Panamá.`,
 };
}

export default async function JobDetailPage({
 params,
}: {
 params: Promise<{ id: string }>;
}) {
 const { id } = await params;
 const job = await getJob(id);

 if (!job) notFound();

 return (
 <>
 <Navbar />
 <main id="main" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 pb-16">
 <Link
 href="/jobs"
 className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 mb-4 cursor-pointer"
 >
 ← Volver a trabajos
 </Link>

 <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
 <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 leading-tight text-balance mb-4">
 {job.title}
 </h1>

 <div className="flex items-center gap-2 text-lg text-slate-700 mb-5">
 <Building2 className="size-5 text-slate-400" aria-hidden />
 <span className="font-bold">{job.company_name || "Empresa confidencial"}</span>
 </div>

 <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-base text-slate-600 mb-5">
 {job.location && (
 <span className="flex items-center gap-2">
 <MapPin className="size-5 text-slate-400" aria-hidden /> {job.location}
 </span>
 )}
 {job.modality && (
 <Badge variant="secondary" className="text-base px-3 py-1.5">
 {job.modality === "remote"
 ? "Remoto"
 : job.modality === "hybrid"
 ? "Híbrido"
 : "Presencial"}
 </Badge>
 )}
 {job.experience_level && (
 <Badge variant="default" className="text-base px-3 py-1.5 capitalize">
 {job.experience_level}
 </Badge>
 )}
 <span className="flex items-center gap-2 font-bold text-success-600">
 <DollarSign className="size-5" aria-hidden />
 {formatSalary(job.salary_min, job.salary_max, job.salary_currency || "USD")}
 </span>
 {job.posted_at && (
 <span className="flex items-center gap-2 text-slate-500">
 <Clock className="size-5 text-slate-400" aria-hidden /> {relativeTime(job.posted_at)}
 </span>
 )}
 </div>

 <div className="flex flex-col sm:flex-row gap-2 mb-2">
 <Button size="lg" asChild>
 <Link href={`/jobs/${id}/apply`}>
 <Briefcase className="size-5" />
 Aplicar ahora
 </Link>
 </Button>
 <Button size="lg" variant="outline">
 <Heart className="size-5" />
 Guardar
 </Button>
 {job.url && (
 <Button size="lg" variant="ghost" asChild>
 <a href={job.url} target="_blank" rel="noopener noreferrer">
 <ExternalLink className="size-5" />
 Ver en {job.source}
 </a>
 </Button>
 )}
 </div>
 <p className="text-xs text-slate-500">
 +10 XP por aplicar · +25 XP cuando el reclutador la vea
 </p>
 </div>

 {Array.isArray(job.skills_extracted) && job.skills_extracted.length > 0 && (
 <section className="mt-8">
 <h2 className="font-display text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
 <Sparkles className="size-5 text-primary-500" aria-hidden />
 Habilidades necesarias
 </h2>
 <div className="flex flex-wrap gap-2">
 {(job.skills_extracted as string[]).map((s) => (
 <Badge key={s} variant="default" className="px-3 py-1.5 text-sm">
 {s}
 </Badge>
 ))}
 </div>
 </section>
 )}

 {Array.isArray(job.benefits_extracted) && job.benefits_extracted.length > 0 && (
 <section className="mt-8">
 <h2 className="font-display text-xl font-bold text-slate-900 mb-3">Beneficios</h2>
 <div className="flex flex-wrap gap-2">
 {(job.benefits_extracted as string[]).map((b) => (
 <Badge key={b} variant="success" className="px-3 py-1.5 text-sm capitalize">
 {b.replaceAll("_", " ")}
 </Badge>
 ))}
 </div>
 </section>
 )}

 {job.description && (
 <section className="mt-8">
 <h2 className="font-display text-xl font-bold text-slate-900 mb-3">Descripción</h2>
 <div
 className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 leading-relaxed"
 dangerouslySetInnerHTML={{ __html: sanitize(job.description as string) }}
 />
 </section>
 )}
 </main>
 <Footer />
 </>
 );
}

function sanitize(html: string): string {
 return html
 .replace(/<script[\s\S]*?<\/script>/gi, "")
 .replace(/<style[\s\S]*?<\/style>/gi, "")
 .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
 .replace(/on\w+="[^"]*"/gi, "");
}
