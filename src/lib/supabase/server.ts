import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseEnv } from "./config";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Server Supabase client bound to the request cookie store. Returns null when
 * Supabase is not configured. The service role key is read only in dedicated
 * admin helpers, never here, and never in client bundles.
 */
export async function createClient() {
  const { url, anonKey, configured } = supabaseEnv();
  if (!configured) return null;

  const cookieStore = await cookies();
  return createServerClient(url!, anonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — safe to ignore; middleware refreshes.
        }
      },
    },
  });
}
