import { useEffect, useState } from "react";
import type { Store } from "@aislepilot/domain/types";
import { getStore } from "./retailer";

/**
 * Resolves a list's storeId to its full Store, live-API-aware. Several
 * screens used to resolve this via findStore() from @aislepilot/domain/mock,
 * which only knows the 3 seeded demo stores — any list pointed at a real
 * Kroger store (from a live search) always got `undefined` back, even
 * though storeId was correctly set, breaking the "pick a store" banner,
 * Shopping Mode, and department/aisle grouping.
 */
export function useStore(storeId: string | undefined): Store | undefined {
  const [store, setStore] = useState<Store | undefined>(undefined);

  useEffect(() => {
    let active = true;
    if (!storeId) {
      setStore(undefined);
      return;
    }
    getStore(storeId).then((s) => {
      if (active) setStore(s ?? undefined);
    });
    return () => {
      active = false;
    };
  }, [storeId]);

  return store;
}
