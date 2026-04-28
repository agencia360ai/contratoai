import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  STORAGE_BUCKET,
  getClientIp,
  hashIp,
  isOverRateLimit,
  type IntakeKind,
} from "@/lib/intake/utils";
import { parseWithClaude, type RawInput } from "@/lib/intake/parser";

export const runtime = "nodejs";
export const maxDuration = 60;

type ClientInput =
  | { type: "text"; content: string }
  | { type: "audio"; transcript: string; path?: string }
  | { type: "image"; path: string; mime: string }
  | { type: "pdf"; path: string };

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await ctx.params;
    const sb = getAdminClient();

    const { data: link } = await sb
      .from("recruiter_intake_links")
      .select("id, recruiter_id, kind")
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
      inputs: ClientInput[];
    };
    if (!body?.kind || !Array.isArray(body.inputs) || !body.inputs.length) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }
    if (link.kind !== "both" && link.kind !== body.kind) {
      return NextResponse.json({ error: "kind_not_allowed" }, { status: 400 });
    }

    const raw: RawInput[] = [];
    for (const i of body.inputs) {
      if (i.type === "text" && i.content?.trim()) {
        raw.push({ type: "text", content: i.content });
      } else if (i.type === "audio" && i.transcript?.trim()) {
        raw.push({ type: "audio_transcript", content: i.transcript });
      } else if (i.type === "image" || i.type === "pdf") {
        const { data } = await sb.storage
          .from(STORAGE_BUCKET)
          .download(i.path);
        if (!data) continue;
        const ab = await data.arrayBuffer();
        const b64 = Buffer.from(ab).toString("base64");
        if (i.type === "image") raw.push({ type: "image", mime: i.mime, base64: b64 });
        else raw.push({ type: "pdf", base64: b64 });
      }
    }

    if (!raw.length) {
      return NextResponse.json({ error: "empty_inputs" }, { status: 400 });
    }

    const { parsed, suggestions } = await parseWithClaude(body.kind, raw);
    return NextResponse.json({ parsed, suggestions });
  } catch (e) {
    return NextResponse.json(
      { error: "server_error", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
