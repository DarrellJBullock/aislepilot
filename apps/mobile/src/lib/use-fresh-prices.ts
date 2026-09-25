import { useEffect, useRef } from "react";
import type { ShoppingList } from "@aislepilot/domain/types";
import { needsPriceRefresh } from "@aislepilot/domain/pricing";
import { useApp } from "@/store/context";
import { fetchFreshProducts } from "./retailer";
import { useOnlineStatus } from "./use-online-status";

/**
 * Re-fetches price/availability for a list's matched items whose stored price
 * is missing or older than PRICE_TTL_MS. Runs when the list is opened and the
 * device is online; one request per distinct set of stale items.
 */
export function useFreshPrices(list?: ShoppingList) {
  const { refreshProducts } = useApp();
  const online = useOnlineStatus();
  const requested = useRef("");

  const storeId = list?.storeId;
  const listId = list?.id;
  const staleKey = list
    ? [...new Set(list.items.filter((i) => needsPriceRefresh(i.product)).map((i) => i.product!.id))]
        .sort()
        .join(",")
    : "";

  useEffect(() => {
    if (!online || !listId || !storeId || !staleKey) return;
    const sig = `${listId}:${staleKey}`;
    if (requested.current === sig) return;
    requested.current = sig;
    fetchFreshProducts(staleKey.split(","), storeId)
      .then((products) => {
        if (products.length) refreshProducts(listId, products);
      })
      .catch(() => {
        requested.current = "";
      });
  }, [online, listId, storeId, staleKey, refreshProducts]);
}
