import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "./config";

/**
 * Browser Supabase client. Returns null when Supabase is not configured so the
 * app can transparently fall back to local mock mode.
 */
export function createClient() {
  const { url, anonKey, configured } = supabaseEnv();
  if (!configured) return null;
  return createBrowserClient(url!, anonKey!);
}
