import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ------------------------------------------------------------
// Supabase scaffolding.
// The app runs entirely on the in-memory mock store (lib/store.tsx)
// when these env vars are absent. Provide them (see .env.example) to
// switch persistence on. Route handlers in app/api/* use these
// helpers; see supabase/schema.sql and supabase/seed.sql.
// ------------------------------------------------------------

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

/** Browser/anon client (read + RLS-guarded writes). */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(url as string, anonKey as string);
}

/** Server client with the service-role key for trusted route handlers. */
export function getSupabaseAdmin(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
