export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, anonKey, configured: Boolean(url && anonKey) };
}

/** True when Supabase is configured. When false the app runs in local mock mode. */
export const SUPABASE_CONFIGURED = supabaseEnv().configured;
