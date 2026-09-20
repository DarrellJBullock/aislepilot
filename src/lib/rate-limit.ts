// Best-effort in-memory fixed-window rate limiter for the retailer API
// routes, keyed per authenticated user. State lives in the warm serverless
// instance (Fluid Compute reuses instances across requests, so this
// meaningfully throttles sustained abuse from one account) but resets on
// cold start and isn't shared across concurrent instances — a cheap first
// layer behind the auth requirement, not a strict guarantee.
const windows = new Map<string, { count: number; resetAt: number }>();

let lastSweep = Date.now();
const SWEEP_INTERVAL_MS = 5 * 60_000;

function sweepExpired(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, entry] of windows) {
    if (now >= entry.resetAt) windows.delete(key);
  }
}

/** Returns true if the call under `key` is allowed within the current window. */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweepExpired(now);

  const entry = windows.get(key);
  if (!entry || now >= entry.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}
