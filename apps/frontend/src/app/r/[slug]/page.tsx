import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminClient } from "@/lib/supabase/admin";
import { IntakeChat } from "@/components/intake/IntakeChat";

type LinkRow = {
  slug: string;
  kind: "job" | "candidate" | "both";
  display_name: string | null;
  display_company: string | null;
  display_avatar: string | null;
  welcome_message: string | null;
};

async function loadLink(slug: string): Promise<LinkRow | null> {
  try {
    const sb = getAdminClient();
    const { data } = await sb
      .from("recruiter_intake_links")
      .select("slug, kind, display_name, display_company, display_avatar, welcome_message")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    return (data as LinkRow | null) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const link = await loadLink(slug);
  if (!link) return { title: "Link no encontrado" };
  const who = link.display_name || "tu reclutador";
  return {
    title: `Cuéntale a ${who} sobre tu vacante`,
    description:
      "Sube tu vacante por audio, texto, foto o PDF. La IA la estructura y se la envía al reclutador.",
  };
}

export default async function RecruiterIntakePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const link = await loadLink(slug);
  if (!link) notFound();

  return (
    <main className="relative min-h-screen pt-12 pb-24">
      <div className="absolute inset-0 bg-grid-light" aria-hidden />
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-gradient-to-br from-gold-100/40 to-transparent blur-3xl opacity-30"
        aria-hidden
      />
      <div className="relative px-4 sm:px-6 lg:px-8">
        <IntakeChat
          link={{
            slug: link.slug,
            kind: link.kind,
            display_name: link.display_name,
            display_company: link.display_company,
            display_avatar: link.display_avatar,
            welcome_message: link.welcome_message,
          }}
          initialKind={link.kind === "candidate" ? "candidate" : "job"}
        />
      </div>
    </main>
  );
}
