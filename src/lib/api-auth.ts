import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isLiveRetailer } from "@/services/retailers/factory";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Resolves the signed-in user for a retailer API route, from either the
 * browser's session cookie (web) or an `Authorization: Bearer <access
 * token>` header (mobile, which has no cookie jar). Returns null when
 * unauthenticated or Supabase isn't configured — callers should reject the
 * request in that case.
 */
async function requireUser(request: Request): Promise<{ id: string } | null> {
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

/**
 * Gate for the /api/retailers/* routes. Signed-in users only, rate limited
 * per user (30/min per bucket) — but only when the live Kroger API is behind
 * the route, since that's the quota being protected. Mock mode (no Kroger
 * credentials, e.g. local dev and e2e) serves fictional data and stays open.
 * Returns a response to send back when the request is blocked, else null.
 */
export async function guardRetailerRoute(
  request: Request,
  bucket: string,
): Promise<NextResponse | null> {
  if (!isLiveRetailer()) return null;
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!checkRateLimit(`${bucket}:${user.id}`, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  return null;
}
