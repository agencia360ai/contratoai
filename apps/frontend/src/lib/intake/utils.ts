import { createHash, randomBytes, randomInt } from "crypto";
import { getAdminClient } from "@/lib/supabase/admin";

export const STORAGE_BUCKET =
  process.env.INTAKE_STORAGE_BUCKET || "intake-uploads";

export const RATE_LIMIT_PER_HOUR = Number(
  process.env.INTAKE_RATE_LIMIT_PER_HOUR || 10,
);

const IP_SECRET = process.env.INTAKE_IP_HASH_SECRET || "dev-only-not-secure";

export function hashIp(ip: string | null | undefined): string {
  return createHash("sha256")
    .update(`${IP_SECRET}:${ip || "unknown"}`)
    .digest("hex");
}

export function getClientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

export function generateVerificationCode(): string {
  return String(randomInt(100000, 1000000));
}

export function newRandomFilename(originalName: string): string {
  const ext = originalName.includes(".")
    ? originalName.slice(originalName.lastIndexOf("."))
    : "";
  return `${Date.now()}-${randomBytes(8).toString("hex")}${ext.toLowerCase()}`;
}

export async function isOverRateLimit(ipHash: string): Promise<boolean> {
  try {
    const sb = getAdminClient();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await sb
      .from("intake_submissions")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("submitted_at", oneHourAgo);
    return (count ?? 0) >= RATE_LIMIT_PER_HOUR;
  } catch {
    return false;
  }
}

export type IntakeKind = "job" | "candidate";

export type ParsedJob = {
  title: string;
  company_name?: string;
  location?: string;
  modality?: "onsite" | "remote" | "hybrid";
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  description: string;
  requirements: string[];
  skills: string[];
  benefits: string[];
  experience_level?: "intern" | "junior" | "mid" | "senior" | "lead" | "exec";
  contract_type?: string;
  industry?: string;
};

export type ParsedCandidate = {
  full_name: string;
  headline?: string;
  location?: string;
  summary: string;
  skills: string[];
  experiences: Array<{
    title: string;
    company: string;
    start?: string;
    end?: string;
    description?: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year?: string;
  }>;
  languages: string[];
  preferences?: {
    desired_role?: string;
    salary_min?: number;
    modality?: "onsite" | "remote" | "hybrid";
    industries?: string[];
  };
};
