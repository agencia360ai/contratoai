import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  sendEmail,
  jobPublishedRecruiterHtml,
  jobPublishedSubmitterHtml,
  candidateAddedRecruiterHtml,
  candidateAddedSubmitterHtml,
} from "@/lib/email/resend";
import type { ParsedCandidate, ParsedJob } from "@/lib/intake/utils";

export const runtime = "nodejs";

function fingerprint(parts: string[]): string {
  return createHash("sha256").update(parts.join("|").toLowerCase()).digest("hex");
}

async function upsertCompany(
  sb: ReturnType<typeof getAdminClient>,
  name: string,
): Promise<string | null> {
  const norm = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[,.]/g, " ")
    .replace(/ s\.?a\.?\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!norm) return null;
  const existing = await sb
    .from("companies")
    .select("id")
    .eq("normalized_name", norm)
    .maybeSingle();
  if (existing.data?.id) return existing.data.id as string;
  const created = await sb
    .from("companies")
    .insert({ name: name.trim(), normalized_name: norm })
    .select("id")
    .single();
  return (created.data?.id as string) || null;
}

async function publishJob(
  sb: ReturnType<typeof getAdminClient>,
  recruiterId: string,
  parsed: ParsedJob,
  submissionId: string,
  siteUrl: string,
): Promise<{ id: string; url: string } | null> {
  const companyId = parsed.company_name
    ? await upsertCompany(sb, parsed.company_name)
    : null;

  const sourceId = `intake-${submissionId}`;
  const url = `${siteUrl}/jobs/${sourceId}`;

  const insert = await sb
    .from("jobs")
    .insert({
      source: "tecontrato_intake",
      source_id: sourceId,
      url,
      fingerprint: fingerprint([
        "tecontrato_intake",
        sourceId,
        parsed.title,
        parsed.company_name || "",
      ]),
      title: parsed.title,
      company_id: companyId,
      location: parsed.location || "Ciudad de Panamá",
      modality: parsed.modality || null,
      salary_min: parsed.salary_min ?? null,
      salary_max: parsed.salary_max ?? null,
      salary_currency: parsed.salary_currency || "USD",
      description: parsed.description,
      requirements_extracted: parsed.requirements || [],
      skills_extracted: parsed.skills || [],
      benefits_extracted: parsed.benefits || [],
      experience_level: parsed.experience_level || null,
      contract_type: parsed.contract_type || null,
      industry: parsed.industry || null,
      is_active: true,
      extra: { recruiter_id: recruiterId, source_kind: "intake_link" },
    })
    .select("id")
    .single();
  if (insert.error || !insert.data) return null;
  return { id: insert.data.id as string, url };
}

async function publishCandidate(
  sb: ReturnType<typeof getAdminClient>,
  parsed: ParsedCandidate,
  email: string,
): Promise<{ id: string } | null> {
  const emailHash = createHash("sha256").update(email.toLowerCase()).digest("hex");
  const nameHash = createHash("sha256").update(parsed.full_name.toLowerCase()).digest("hex");

  const insert = await sb
    .from("candidates")
    .insert({
      display_name: parsed.full_name,
      full_name_hash: nameHash,
      email_hash: emailHash,
      location: parsed.location || null,
      profile_data: {
        headline: parsed.headline,
        summary: parsed.summary,
        source: "intake_link",
      },
      skills: parsed.skills || [],
      experiences: parsed.experiences || [],
      education: parsed.education || [],
      languages: parsed.languages || [],
      preferences: parsed.preferences || {},
      onboarding_step: 99,
      onboarding_complete: true,
      profile_completion: 80,
      consent_data: { source: "public_intake_link", at: new Date().toISOString() },
      consent_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (insert.error || !insert.data) return null;
  return { id: insert.data.id as string };
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await ctx.params;
    const sb = getAdminClient();
    const body = (await req.json()) as { submission_id: string; code: string };
    if (!body?.submission_id || !body?.code) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    const { data: linkRaw } = await sb
      .from("recruiter_intake_links")
      .select("id, recruiter_id, display_name, slug, submissions_count, jobs_published, candidates_added")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    const link = linkRaw as
      | {
          id: string;
          recruiter_id: string;
          display_name: string | null;
          slug: string;
          submissions_count: number | null;
          jobs_published: number | null;
          candidates_added: number | null;
        }
      | null;
    if (!link) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const { data: subRaw } = await sb
      .from("intake_submissions")
      .select("*")
      .eq("id", body.submission_id)
      .eq("intake_link_id", link.id)
      .maybeSingle();
    const sub = subRaw as
      | {
          id: string;
          status: string;
          kind: "job" | "candidate";
          parsed_data: unknown;
          confirmer_email: string;
          confirmer_name: string | null;
          verification_code: string | null;
          verification_expires_at: string | null;
          job_id: string | null;
          candidate_id: string | null;
        }
      | null;
    if (!sub) return NextResponse.json({ error: "submission_not_found" }, { status: 404 });

    if (sub.status === "published") {
      return NextResponse.json({ ok: true, already_published: true, job_id: sub.job_id, candidate_id: sub.candidate_id });
    }
    if (sub.status !== "awaiting_verification") {
      return NextResponse.json({ error: "bad_state" }, { status: 400 });
    }
    if (
      sub.verification_expires_at &&
      new Date(sub.verification_expires_at).getTime() < Date.now()
    ) {
      return NextResponse.json({ error: "code_expired" }, { status: 400 });
    }
    if (sub.verification_code !== body.code.trim()) {
      return NextResponse.json({ error: "code_invalid" }, { status: 400 });
    }

    // Recruiter info for emails
    const { data: recruiterRaw } = await sb
      .from("recruiters")
      .select("user_id, display_name")
      .eq("id", link.recruiter_id)
      .maybeSingle();
    const recruiter = recruiterRaw as
      | { user_id: string | null; display_name: string | null }
      | null;

    let recruiterEmail: string | null = null;
    if (recruiter?.user_id) {
      const { data: authUser } = await sb.auth.admin.getUserById(recruiter.user_id);
      recruiterEmail = authUser?.user?.email || null;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tecontrato.pa";
    let jobId: string | null = null;
    let candidateId: string | null = null;
    let resultUrl: string | undefined;

    if (sub.kind === "job") {
      const r = await publishJob(
        sb,
        link.recruiter_id,
        sub.parsed_data as ParsedJob,
        sub.id,
        siteUrl,
      );
      if (!r) return NextResponse.json({ error: "publish_failed" }, { status: 500 });
      jobId = r.id;
      resultUrl = r.url;
    } else {
      const r = await publishCandidate(
        sb,
        sub.parsed_data as ParsedCandidate,
        sub.confirmer_email,
      );
      if (!r) return NextResponse.json({ error: "publish_failed" }, { status: 500 });
      candidateId = r.id;
    }

    await sb
      .from("intake_submissions")
      .update({
        status: "published",
        email_verified: true,
        confirmed_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        job_id: jobId,
        candidate_id: candidateId,
      })
      .eq("id", sub.id);

    await sb
      .from("recruiter_intake_links")
      .update({
        submissions_count: (link.submissions_count || 0) + 1,
        ...(jobId
          ? { jobs_published: (link.jobs_published || 0) + 1 }
          : { candidates_added: (link.candidates_added || 0) + 1 }),
      })
      .eq("id", link.id);

    // Notify recruiter + submitter
    if (sub.kind === "job") {
      const parsed = sub.parsed_data as ParsedJob;
      if (recruiterEmail) {
        await sendEmail({
          to: recruiterEmail,
          subject: `Nueva vacante: ${parsed.title}`,
          html: jobPublishedRecruiterHtml({
            jobTitle: parsed.title,
            companyName: parsed.company_name,
            submitterEmail: sub.confirmer_email,
            submitterName: sub.confirmer_name || undefined,
            jobUrl: resultUrl,
          }),
        });
      }
      await sendEmail({
        to: sub.confirmer_email,
        subject: `Tu vacante "${parsed.title}" quedó registrada`,
        html: jobPublishedSubmitterHtml({
          jobTitle: parsed.title,
          recruiterName: link.display_name || undefined,
          jobUrl: resultUrl,
        }),
      });
    } else {
      const parsed = sub.parsed_data as ParsedCandidate;
      if (recruiterEmail) {
        await sendEmail({
          to: recruiterEmail,
          subject: `Nuevo candidato: ${parsed.full_name}`,
          html: candidateAddedRecruiterHtml({
            candidateName: parsed.full_name,
            candidateEmail: sub.confirmer_email,
            headline: parsed.headline,
          }),
        });
      }
      await sendEmail({
        to: sub.confirmer_email,
        subject: "Tu perfil quedó registrado",
        html: candidateAddedSubmitterHtml({
          candidateName: parsed.full_name,
          recruiterName: link.display_name || undefined,
        }),
      });
    }

    return NextResponse.json({
      ok: true,
      job_id: jobId,
      candidate_id: candidateId,
      url: resultUrl,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "server_error", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
