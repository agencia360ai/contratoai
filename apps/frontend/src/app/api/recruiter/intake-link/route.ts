import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

async function uniqueSlug(
  admin: ReturnType<typeof getAdminClient>,
  base: string,
): Promise<string> {
  let candidate = base || "reclutador";
  let n = 0;
  while (n < 25) {
    const { data } = await admin
      .from("recruiter_intake_links")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    n += 1;
    candidate = `${base}-${n + 1}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function GET() {
  const sb = await createClient();
  if (!sb) return NextResponse.json({ error: "not_configured" }, { status: 500 });

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const { data: recruiterRaw } = await admin
    .from("recruiters")
    .select("id, display_name, company:companies(name, logo_url)")
    .eq("user_id", user.id)
    .maybeSingle();
  const recruiter = recruiterRaw as
    | {
        id: string;
        display_name: string | null;
        company:
          | { name: string | null; logo_url: string | null }
          | { name: string | null; logo_url: string | null }[]
          | null;
      }
    | null;
  if (!recruiter)
    return NextResponse.json({ error: "no_recruiter" }, { status: 404 });

  const { data: existing } = await admin
    .from("recruiter_intake_links")
    .select(
      "id, slug, kind, display_name, display_company, display_avatar, welcome_message, is_active, submissions_count, jobs_published, candidates_added",
    )
    .eq("recruiter_id", recruiter.id)
    .maybeSingle();

  if (existing) return NextResponse.json(existing);

  const baseName = recruiter.display_name || user.email || "rec";
  const slug = await uniqueSlug(admin, slugify(baseName));
  const company = Array.isArray(recruiter.company)
    ? recruiter.company[0]
    : recruiter.company;

  const { data: created, error } = await admin
    .from("recruiter_intake_links")
    .insert({
      recruiter_id: recruiter.id,
      slug,
      kind: "both",
      display_name: recruiter.display_name,
      display_company: company?.name || null,
      display_avatar: company?.logo_url || null,
    })
    .select(
      "id, slug, kind, display_name, display_company, display_avatar, welcome_message, is_active, submissions_count, jobs_published, candidates_added",
    )
    .single();
  if (error || !created) {
    return NextResponse.json(
      { error: "create_failed", message: error?.message },
      { status: 500 },
    );
  }
  return NextResponse.json(created);
}

export async function PATCH(req: Request) {
  const sb = await createClient();
  if (!sb) return NextResponse.json({ error: "not_configured" }, { status: 500 });
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const { data: recruiterRaw } = await admin
    .from("recruiters")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  const recruiter = recruiterRaw as { id: string } | null;
  if (!recruiter)
    return NextResponse.json({ error: "no_recruiter" }, { status: 404 });

  const body = (await req.json()) as Partial<{
    welcome_message: string;
    kind: "job" | "candidate" | "both";
    is_active: boolean;
    display_name: string;
    display_company: string;
  }>;
  const update: Record<string, unknown> = {};
  for (const k of [
    "welcome_message",
    "kind",
    "is_active",
    "display_name",
    "display_company",
  ] as const) {
    if (body[k] !== undefined) update[k] = body[k];
  }
  if (!Object.keys(update).length)
    return NextResponse.json({ error: "no_changes" }, { status: 400 });

  const { data, error } = await admin
    .from("recruiter_intake_links")
    .update(update)
    .eq("recruiter_id", recruiter.id)
    .select(
      "id, slug, kind, display_name, display_company, welcome_message, is_active",
    )
    .single();
  if (error)
    return NextResponse.json(
      { error: "update_failed", message: error.message },
      { status: 500 },
    );
  return NextResponse.json(data);
}
