import Link from "next/link";
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Sparkles,
  ArrowUpRight,
  Briefcase,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MatchScoreRing } from "@/components/game/MatchScoreRing";
import { formatSalary, relativeTime } from "@/lib/utils";
import type { Modality } from "@/lib/types";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  modality: Modality | null;
  experienceLevel?: string | null;
  postedAt: string | null;
  matchScore?: number | null;
  matchExplanation?: string | null;
  skills?: string[];
  industry?: string | null;
}

const LEVEL_LABELS: Record<string, string> = {
  intern: "Pasante",
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  lead: "Lead",
  exec: "Exec",
};

function isAnonymousCompany(name?: string | null): boolean {
  if (!name) return true;
  const n = name.toLowerCase();
  return (
    n.includes("confidencial") ||
    n.includes("confidential") ||
    n === "empresa del sector logistico" ||
    n.startsWith("importante empresa") ||
    n.length < 3
  );
}

function companyInitials(name?: string | null): string {
  if (!name) return "?";
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w[0]).join("").toUpperCase();
}

export function JobCard({
  id,
  title,
  company,
  location,
  salaryMin,
  salaryMax,
  salaryCurrency,
  modality,
  experienceLevel,
  postedAt,
  matchScore,
  matchExplanation,
  skills = [],
  industry,
}: JobCardProps) {
  const anon = isAnonymousCompany(company);
  const displayName = anon ? "Empresa anónima" : company;

  return (
    <Link
      href={`/jobs/${id}`}
      className="group relative block rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-900 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <ArrowUpRight
        className="absolute top-5 right-5 size-5 text-slate-300 group-hover:text-slate-900 transition-colors"
        aria-hidden
      />

      <div className="flex items-start gap-4">
        {matchScore != null ? (
          <MatchScoreRing score={matchScore} size={56} strokeWidth={5} />
        ) : (
          <div
            className={`grid size-14 shrink-0 place-items-center rounded-xl font-display font-bold text-base ${
              anon
                ? "bg-slate-100 text-slate-400 border border-slate-200"
                : "bg-gradient-to-br from-slate-900 to-slate-700 text-white"
            }`}
            aria-hidden
          >
            {anon ? <Building2 className="size-6" /> : companyInitials(company)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-bold text-slate-900 leading-snug pr-8 mb-1">
            {title}
          </h3>

          <div className="flex items-center gap-2 text-sm mb-3 flex-wrap">
            <span className={`font-semibold ${anon ? "text-slate-500 italic" : "text-slate-700"}`}>
              {displayName}
            </span>
            {industry && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500">{industry}</span>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <DataChip
              icon={DollarSign}
              label="Salario"
              value={formatSalary(salaryMin, salaryMax, salaryCurrency || "USD")}
              valueClass="text-emerald-700 font-mono font-bold"
              accent="emerald"
            />
            <DataChip
              icon={MapPin}
              label="Ubicación"
              value={location?.replace(/Panamá,?\s?Panamá/i, "Panamá") || "Panamá"}
            />
            <DataChip
              icon={Briefcase}
              label="Modalidad"
              value={
                modality === "remote"
                  ? "Remoto"
                  : modality === "hybrid"
                    ? "Híbrido"
                    : modality === "onsite"
                      ? "Presencial"
                      : "—"
              }
              accent={modality === "remote" ? "indigo" : undefined}
            />
            <DataChip
              icon={Clock}
              label="Publicado"
              value={postedAt ? relativeTime(postedAt) : "Hoy"}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {experienceLevel && (
              <Badge variant="default" className="capitalize">
                {LEVEL_LABELS[experienceLevel] || experienceLevel}
              </Badge>
            )}
            {skills.slice(0, 4).map((s) => (
              <Badge key={s} variant="outline">
                {s}
              </Badge>
            ))}
            {skills.length > 4 && (
              <span className="text-xs text-slate-500 font-mono">
                +{skills.length - 4} más
              </span>
            )}
          </div>

          {matchExplanation && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-gradient-to-r from-gold-50 to-amber-50/60 p-3 text-sm border border-gold-200">
              <Sparkles className="size-4 mt-0.5 shrink-0 text-gold-700" aria-hidden />
              <span className="text-gold-900">{matchExplanation}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function DataChip({
  icon: Icon,
  label,
  value,
  valueClass,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueClass?: string;
  accent?: "emerald" | "indigo";
}) {
  const accentClass =
    accent === "emerald"
      ? "border-emerald-200 bg-emerald-50/40"
      : accent === "indigo"
        ? "border-indigo-200 bg-indigo-50/40"
        : "border-slate-200 bg-slate-50/60";
  return (
    <div className={`rounded-lg border ${accentClass} px-3 py-2 min-w-0`}>
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="size-3 text-slate-500" aria-hidden />
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
          {label}
        </span>
      </div>
      <p className={`text-sm font-semibold truncate ${valueClass || "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}
