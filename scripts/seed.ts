/**
 * Seed Supabase reference data (retailers, stores, departments, product cache,
 * and estimated locations) from the mock catalog.
 *
 * Usage: npm run seed
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the env.
 * In local mock mode (no Supabase configured) this is a no-op — the app seeds
 * demo data in the browser automatically.
 */
import { createClient } from "@supabase/supabase-js";
import { MOCK_STORES, allMockProducts } from "../src/data/mock/stores";
import { DEPARTMENTS } from "../src/data/mock/departments";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.log(
      "[seed] Supabase not configured — skipping. The app runs in local mock mode " +
        "and seeds demo data in the browser automatically.",
    );
    return;
  }

  const db = createClient(url, serviceKey, { auth: { persistSession: false } });

  console.log("[seed] Upserting retailers…");
  await db.from("retailers").upsert({ id: "kroger", name: "Kroger (demo)", demo: true });

  console.log(`[seed] Upserting ${MOCK_STORES.length} stores + departments…`);
  for (const store of MOCK_STORES) {
    await db.from("stores").upsert({
      id: store.id,
      retailer: store.retailer,
      name: store.name,
      banner: store.banner,
      address: store.address,
      city: store.city,
      state: store.state,
      zip: store.zip,
      demo: store.demo,
    });
    await db.from("store_departments").delete().eq("store_id", store.id);
    await db.from("store_departments").insert(
      DEPARTMENTS.map((d) => ({
        store_id: store.id,
        name: d.name,
        route_order: d.routeOrder,
      })),
    );
  }

  const products = allMockProducts();
  console.log(`[seed] Upserting ${products.length} cached products + locations…`);
  await db.from("products_cache").upsert(
    products.map((p) => ({
      id: p.id,
      store_id: p.storeId,
      external_id: p.externalId,
      payload: p,
      source_updated_at: p.sourceUpdatedAt,
    })),
  );
  await db.from("store_product_locations").upsert(
    products.map((p) => ({
      store_id: p.storeId!,
      external_id: p.externalId,
      aisle: p.aisle,
      section: p.section,
      route_order: p.routeOrder,
      location_source: p.locationSource,
    })),
    { onConflict: "store_id,external_id" },
  );

  console.log("[seed] Done.");
}

main().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
