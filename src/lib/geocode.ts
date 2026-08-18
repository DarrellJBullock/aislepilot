import "server-only";
import cityZipData from "@/data/us-city-zip.json";

const byCityState: Record<string, string> = cityZipData.byCityState;
const byCity: Record<string, string> = cityZipData.byCity;

// GeoNames spells these out in full (e.g. "Saint Louis"), but users
// commonly type the abbreviation — expand it before looking up.
// Boundary check goes right after the letters, before the optional period —
// \bst\.?\b would fail on "st. louis" since \b can't match between the
// period and the following space (neither is a word character).
const ABBREVIATIONS: [RegExp, string][] = [
  [/\bst\b\.?/g, "saint"],
  [/\bft\b\.?/g, "fort"],
  [/\bmt\b\.?/g, "mount"],
];

const US_STATE_CODES = new Set([
  "al", "ak", "az", "ar", "ca", "co", "ct", "de", "fl", "ga", "hi", "id", "il", "in", "ia",
  "ks", "ky", "la", "me", "md", "ma", "mi", "mn", "ms", "mo", "mt", "ne", "nv", "nh", "nj",
  "nm", "ny", "nc", "nd", "oh", "ok", "or", "pa", "ri", "sc", "sd", "tn", "tx", "ut", "vt",
  "va", "wa", "wv", "wi", "wy", "dc",
]);

function normalizeCity(city: string): string {
  let s = city.toLowerCase().trim().replace(/\s+/g, " ");
  for (const [pattern, replacement] of ABBREVIATIONS) s = s.replace(pattern, replacement);
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Resolves a free-text city (optionally "City, ST" or "City ST") to a ZIP
 * code, so the live Kroger provider — which only supports geo-anchored
 * search (filter.zipCode.near), not free-text city search — can be queried.
 * Returns undefined when nothing matches; callers should fall through to
 * "no results" rather than guessing.
 */
export function resolveCityToZip(query: string): string | undefined {
  const trimmed = query.trim();
  if (!trimmed) return undefined;

  // "City, ST" (comma-separated) or "City ST" (trailing 2-letter state).
  const commaMatch = trimmed.match(/^(.+?),\s*([a-zA-Z]{2})$/);
  const spaceMatch = !commaMatch && trimmed.match(/^(.+?)\s+([a-zA-Z]{2})$/);
  const match = commaMatch ?? spaceMatch;

  if (match) {
    const state = match[2].toLowerCase();
    if (US_STATE_CODES.has(state)) {
      const city = normalizeCity(match[1]);
      const hit = byCityState[`${city}|${state}`];
      if (hit) return hit;
    }
  }

  return byCity[normalizeCity(trimmed)];
}
