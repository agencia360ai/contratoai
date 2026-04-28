"use client";

import { useEffect, useState } from "react";
import { Copy, Check, ExternalLink, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type LinkData = {
  id: string;
  slug: string;
  kind: "job" | "candidate" | "both";
  submissions_count?: number;
  jobs_published?: number;
  candidates_added?: number;
};

export function IntakeLinkCard() {
  const [data, setData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"job" | "candidate" | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/recruiter/intake-link")
      .then(async (r) => {
        const j = await r.json();
        if (!alive) return;
        if (!r.ok) setError(j.error || "load_failed");
        else setData(j as LinkData);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-2 text-slate-500">
        <Loader2 className="size-4 animate-spin" /> Cargando tu link…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
        No pude cargar tu link público. {error}
      </div>
    );
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://tecontrato.pa";
  const jobUrl = `${origin}/r/${data.slug}`;
  const candUrl = `${origin}/c/${data.slug}`;

  const copy = (which: "job" | "candidate") => {
    navigator.clipboard.writeText(which === "job" ? jobUrl : candUrl).catch(() => {});
    setCopied(which);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="size-4 text-violet-600" />
        <h3 className="font-semibold text-slate-900">Tu link público</h3>
      </div>
      <p className="text-sm text-slate-600 mb-4">
        Compártelo por WhatsApp, email o donde quieras. La gente sube su vacante
        o CV y a ti te llegan estructurados.
      </p>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">
            Para vacantes
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <code className="text-sm text-slate-700 truncate flex-1">{jobUrl}</code>
            <Button size="icon" variant="ghost" onClick={() => copy("job")}>
              {copied === "job" ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
            </Button>
            <a
              href={jobUrl}
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-md text-slate-500 hover:text-slate-900"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">
            Para candidatos
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <code className="text-sm text-slate-700 truncate flex-1">{candUrl}</code>
            <Button size="icon" variant="ghost" onClick={() => copy("candidate")}>
              {copied === "candidate" ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
            </Button>
            <a
              href={candUrl}
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-md text-slate-500 hover:text-slate-900"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      </div>

      {(data.jobs_published || data.candidates_added) ? (
        <div className="mt-4 flex gap-4 text-xs text-slate-500">
          <span>
            <strong className="text-slate-900">{data.jobs_published || 0}</strong> vacantes
          </span>
          <span>
            <strong className="text-slate-900">{data.candidates_added || 0}</strong> candidatos
          </span>
          <span>
            <strong className="text-slate-900">{data.submissions_count || 0}</strong> envíos
          </span>
        </div>
      ) : null}
    </div>
  );
}
