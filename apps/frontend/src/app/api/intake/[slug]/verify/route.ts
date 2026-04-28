import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  generateVerificationCode,
  getClientIp,
  hashIp,
  isOverRateLimit,
  type IntakeKind,
} from "@/lib/intake/utils";
import { sendEmail, verificationEmailHtml } from "@/lib/email/resend";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await ctx.params;
    const sb = getAdminClient();

    const { data: linkRaw } = await sb
      .from("recruiter_intake_links")
      .select("id, recruiter_id, display_name")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    const link = linkRaw as
      | { id: string; recruiter_id: string; display_name: string | null }
      | null;
    if (!link) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const ipHash = hashIp(getClientIp(req));
    if (await isOverRateLimit(ipHash)) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const body = (await req.json()) as {
      kind: IntakeKind;
      email: string;
      name?: string;
      phone?: string;
      raw_inputs?: unknown[];
      parsed_data?: unknown;
      ai_suggestions?: unknown[];
    };

    if (!body?.email || !EMAIL_RE.test(body.email.trim())) {
      return NextResponse.json({ error: "bad_email" }, { status: 400 });
    }
    if (!body.kind || !body.parsed_data) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    const code = generateVerificationCode();
    const ua = req.headers.get("user-agent") || "";

    const insert = await sb
      .from("intake_submissions")
      .insert({
        intake_link_id: link.id,
        recruiter_id: link.recruiter_id,
        kind: body.kind,
        raw_inputs: body.raw_inputs || [],
        parsed_data: body.parsed_data,
        ai_suggestions: body.ai_suggestions || [],
        confirmer_email: body.email.trim().toLowerCase(),
        confirmer_name: body.name || null,
        confirmer_phone: body.phone || null,
        verification_code: code,
        verification_sent_at: new Date().toISOString(),
        verification_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        status: "awaiting_verification",
        ip_hash: ipHash,
        user_agent: ua.slice(0, 300),
      })
      .select("id")
      .single();

    if (insert.error || !insert.data) {
      return NextResponse.json(
        { error: "insert_failed", message: insert.error?.message },
        { status: 500 },
      );
    }

    const send = await sendEmail({
      to: body.email,
      subject:
        body.kind === "job"
          ? "Confirma tu vacante en TeContrato Panamá"
          : "Confirma tu perfil en TeContrato Panamá",
      html: verificationEmailHtml({
        code,
        recruiterName: link.display_name || undefined,
        kind: body.kind,
      }),
    });

    return NextResponse.json({
      submission_id: insert.data.id,
      email_sent: send.ok,
      // Devuelve el código solo en dev cuando Resend no está configurado.
      ...(send.ok ? {} : { dev_code: process.env.NODE_ENV !== "production" ? code : undefined }),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "server_error", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
