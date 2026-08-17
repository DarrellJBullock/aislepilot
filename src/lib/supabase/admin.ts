import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./config";

/**
 * Service-role Supabase client — bypasses RLS. Server-only, used to write
 * reference data (stores, departments) that clients may only read (see
 * supabase/migrations/0002_rls.sql: "Reference data is world-readable,
 * writable only by service role"). Never imported into client bundles.
 */
export function createAdminClient() {
  const { url } = supabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
