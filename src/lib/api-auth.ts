import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Resolves the signed-in user for a retailer API route, from either the
 * browser's session cookie (web) or an `Authorization: Bearer <access
 * token>` header (mobile, which has no cookie jar). Returns null when
 * unauthenticated or Supabase isn't configured — callers should reject the
 * request in that case.
 */
export async function requireUser(request: Request): Promise<{ id: string } | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const { data, error } = await supabase.auth.getUser(authHeader.slice(7));
    return error || !data.user ? null : { id: data.user.id };
  }

  const { data, error } = await supabase.auth.getUser();
  return error || !data.user ? null : { id: data.user.id };
}
