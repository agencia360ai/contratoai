import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  getClientIp,
  hashIp,
  isOverRateLimit,
  type IntakeKind,
} from "@/lib/intake/utils";
import { editWithClaude } from "@/lib/intake/parser";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await ctx.params;
    const sb = getAdminClient();

    const { data: link } = await sb
      .from("recruiter_intake_links")
      .select("id, kind")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (!link) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const ipHash = hashIp(getClientIp(req));
    if (await isOverRateLimit(ipHash)) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const body = (await req.json()) as {
      kind: IntakeKind;
      parsed: Record<string, unknown>;
      suggestions?: string[];
      instruction: string;
    };

    if (!body?.kind || !body.parsed || typeof body.instruction !== "string") {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    if (!body.instruction.trim()) {
      return NextResponse.json({ error: "empty_instruction" }, { status: 400 });
    }
    if (link.kind !== "both" && link.kind !== body.kind) {
      return NextResponse.json({ error: "kind_not_allowed" }, { status: 400 });
    }

    const { parsed, suggestions, changeSummary } = await editWithClaude(
      body.kind,
      body.parsed,
      Array.isArray(body.suggestions) ? body.suggestions : [],
      body.instruction,
    );

    return NextResponse.json({ parsed, suggestions, change_summary: changeSummary });
  } catch (e) {
    return NextResponse.json(
      { error: "server_error", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
