import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  try {
    const sb = getAdminClient();
    const { data, error } = await sb
      .from("recruiter_intake_links")
      .select(
        "id, slug, kind, display_name, display_company, display_avatar, welcome_message, recruiter_id",
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({
      slug: data.slug,
      kind: data.kind,
      display_name: data.display_name,
      display_company: data.display_company,
      display_avatar: data.display_avatar,
      welcome_message: data.welcome_message,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "server_error", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
