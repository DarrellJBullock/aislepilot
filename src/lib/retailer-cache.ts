import "server-only";
import type { Store } from "@aislepilot/domain/types";
import { createAdminClient } from "./supabase/admin";

/**
 * Upserts live/demo stores (and their departments) into the stores/
 * store_departments reference tables so shopping_lists.store_id's FK
 * constraint is satisfied the moment a user picks a store — previously only
 * the 3 seed-script demo stores existed there, so creating a list against
 * any store returned by a live Kroger search failed with
 * "insert or update on table shopping_lists violates foreign key
 * constraint shopping_lists_store_id_fkey". Best-effort: caching failures
 * are logged, never thrown, so a Supabase hiccup can't break store search.
 */
export async function cacheStores(stores: Store[]): Promise<void> {
  if (stores.length === 0) return;
  const admin = createAdminClient();
  if (!admin) return;

  try {
    const retailerIds = [...new Set(stores.map((s) => s.retailer))];
    await admin.from("retailers").upsert(
      retailerIds.map((id) => {
        const isDemo = stores.filter((s) => s.retailer === id).every((s) => s.demo);
        return { id, name: id.charAt(0).toUpperCase() + id.slice(1), demo: isDemo };
      }),
      { onConflict: "id" },
    );

    await admin.from("stores").upsert(
      stores.map((s) => ({
        id: s.id,
        retailer: s.retailer,
        name: s.name,
        banner: s.banner,
        address: s.address,
        city: s.city,
        state: s.state,
        zip: s.zip,
        demo: s.demo,
      })),
      { onConflict: "id" },
    );

    for (const store of stores) {
      if (!store.departments.length) continue;
      await admin.from("store_departments").delete().eq("store_id", store.id);
      await admin
        .from("store_departments")
        .insert(store.departments.map((d) => ({ store_id: store.id, name: d.name, route_order: d.routeOrder })));
    }
  } catch (err) {
    console.error("[retailer-cache] failed to cache stores:", err);
  }
}
