import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Permissive Database stub so PostgREST builders don't collapse to `never`.
type GenericTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};
type GenericFn = { Args: Record<string, unknown>; Returns: unknown };
type AnyDatabase = {
  public: {
    Tables: Record<string, GenericTable>;
    Views: Record<string, GenericTable>;
    Functions: Record<string, GenericFn>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, Record<string, unknown>>;
  };
};

export type AdminClient = SupabaseClient<AnyDatabase>;

let cached: AdminClient | null = null;

export function getAdminClient(): AdminClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase admin client not configured: SUPABASE_URL/SUPABASE_SERVICE_KEY missing",
    );
  }
  cached = createClient<AnyDatabase>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
