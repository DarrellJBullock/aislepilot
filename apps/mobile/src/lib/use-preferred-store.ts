import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Store } from "@aislepilot/domain/types";
import { getStore } from "./retailer";

const KEY = "aislepilot.preferredStoreId";

/** The user's chosen "home" store for quick display — separate from any
 * individual list's storeId (a list can target a different store). */
export function usePreferredStore() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const id = await AsyncStorage.getItem(KEY);
      if (!active) return;
      setStoreId(id);
      if (id) setStore(await getStore(id));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const setPreferredStore = useCallback(async (id: string, s: Store) => {
    await AsyncStorage.setItem(KEY, id);
    setStoreId(id);
    setStore(s);
  }, []);

  return { storeId, store, loading, setPreferredStore };
}
