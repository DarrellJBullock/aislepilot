/**
 * Live Kroger API smoke test. Run once you have credentials to confirm the
 * OAuth flow and Locations/Products mapping end-to-end against the real API.
 *
 *   npm run kroger:smoke -- [zip]        # default zip: 45202 (Cincinnati, OH)
 *
 * Reads KROGER_CLIENT_ID / KROGER_CLIENT_SECRET / KROGER_BASE_URL from the
 * environment (and from .env.local if present). Makes real network calls; it
 * bypasses the mock/live factory and constructs KrogerProvider directly.
 */
import { readFileSync } from "node:fs";
import { KrogerProvider } from "../src/providers/kroger";
import { effectiveUnitPrice } from "../src/domain/pricing";
import { locationConfidence } from "../src/domain/status/location";

// Minimal .env.local loader (no dependency on dotenv).
function loadEnvLocal() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* no .env.local — rely on the ambient environment */
  }
}

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

async function main() {
  loadEnvLocal();
  const clientId = process.env.KROGER_CLIENT_ID;
  const clientSecret = process.env.KROGER_CLIENT_SECRET;
  const baseUrl = process.env.KROGER_BASE_URL ?? "https://api.kroger.com/v1";

  if (!clientId || !clientSecret) {
    console.log(
      "[kroger-smoke] No credentials found.\n" +
        "  Set KROGER_CLIENT_ID and KROGER_CLIENT_SECRET in .env.local, then re-run.\n" +
        "  Get them at https://developer.kroger.com (scope: product.compact).",
    );
    return;
  }

  const zip = process.argv[2] ?? "45202";
  const provider = new KrogerProvider({ clientId, clientSecret, baseUrl });

  console.log(`\n① Auth + store search near ${zip}…`);
  const stores = await provider.searchStores({ zip, limit: 5 });
  if (stores.length === 0) {
    console.log("  No stores returned for that zip. Try another zip code.");
    return;
  }
  for (const s of stores) {
    console.log(`  • ${s.banner} — ${s.name} (${s.id})  ${s.city}, ${s.state} ${s.zip}`);
  }

  const store = stores[0];
  console.log(`\n② Product search "milk" at ${store.name}…`);
  const products = await provider.searchProducts({ query: "milk", storeId: store.id, limit: 5 });
  for (const p of products) {
    const loc = locationConfidence(p.locationSource);
    console.log(
      `  • ${p.name} — ${p.brand ?? "?"} ${p.size ?? ""}\n` +
        `      ${money(effectiveUnitPrice(p))}` +
        `${p.promotionalPrice ? ` (promo, reg ${money(p.regularPrice ?? 0)})` : ""}` +
        ` · ${p.availability}` +
        ` · aisle ${p.aisle ?? "—"} [${loc.label}${loc.verified ? " ✓" : ""}]`,
    );
  }

  const withUpc = products.find((p) => p.upc);
  if (withUpc?.upc) {
    console.log(`\n③ Barcode lookup for UPC ${withUpc.upc}…`);
    const found = await provider.lookupBarcode(withUpc.upc, store.id);
    console.log(found ? `  ✓ ${found.name}` : "  ✗ not found");

    console.log(`\n④ Availability for ${withUpc.name}…`);
    const avail = await provider.getAvailability(withUpc.id, store.id);
    console.log(`  ${avail.availability}`);
  }

  console.log(`\n✅ Live Kroger path OK. Capabilities:`, provider.getCapabilities());
}

main().catch((err) => {
  console.error("\n[kroger-smoke] FAILED:", err instanceof Error ? err.message : err);
  console.error(
    "  Common causes: invalid credentials, app not granted Products/Locations access,\n" +
      "  or rate-limit exceeded. Verify at https://developer.kroger.com.",
  );
  process.exit(1);
});
