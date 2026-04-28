import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  STORAGE_BUCKET,
  getClientIp,
  hashIp,
  isOverRateLimit,
  newRandomFilename,
} from "@/lib/intake/utils";
import { transcribeAudio } from "@/lib/intake/whisper";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await ctx.params;
    const sb = getAdminClient();

    const { data: link } = await sb
      .from("recruiter_intake_links")
      .select("id, recruiter_id")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (!link) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const ipHash = hashIp(getClientIp(req));
    if (await isOverRateLimit(ipHash)) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "no_file" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "file_too_large" }, { status: 413 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "application/octet-stream";
    const isAudio = mime.startsWith("audio/");
    const isImage = mime.startsWith("image/");
    const isPdf = mime === "application/pdf";

    if (!isAudio && !isImage && !isPdf) {
      return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
    }

    const path = `${link.id}/${newRandomFilename(file.name || "upload")}`;
    const { error: upErr } = await sb.storage
      .from(STORAGE_BUCKET)
      .upload(path, buf, { contentType: mime, upsert: false });
    if (upErr) {
      return NextResponse.json(
        { error: "upload_failed", message: upErr.message },
        { status: 500 },
      );
    }

    let transcript: string | undefined;
    if (isAudio) {
      const t = await transcribeAudio(buf, file.name || "audio", mime);
      if (t.ok) transcript = t.text;
    }

    const kind = isAudio ? "audio" : isImage ? "image" : "pdf";
    return NextResponse.json({
      kind,
      mime,
      path,
      filename: file.name,
      size: file.size,
      transcript,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "server_error", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
