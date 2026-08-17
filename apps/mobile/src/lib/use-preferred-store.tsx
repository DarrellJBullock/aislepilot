import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Store } from "@aislepilot/domain/types";
import { getStore } from "./retailer";

const KEY = "aislepilot.preferredStoreId";

interface PreferredStoreValue {
  storeId: string | null;
  store: Store | null;
  loading: boolean;
  setPreferredStore: (id: string, s: Store) => Promise<void>;
}

const PreferredStoreContext = createContext<PreferredStoreValue | null>(null);

/** The user's chosen "home" store for quick display — separate from any
 * individual list's storeId (a list can target a different store). One
 * instance shared via context so selecting a store on any screen (e.g. Shop)
 * is immediately visible on every other screen (e.g. Home) — a plain hook
 * per-screen would each own an independent useState that never syncs. */
export function PreferredStoreProvider({ children }: { children: ReactNode }) {
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

  const value = useMemo(
    () => ({ storeId, store, loading, setPreferredStore }),
    [storeId, store, loading, setPreferredStore],
  );

  return <PreferredStoreContext.Provider value={value}>{children}</PreferredStoreContext.Provider>;
}

export function usePreferredStore(): PreferredStoreValue {
  const ctx = useContext(PreferredStoreContext);
  if (!ctx) throw new Error("usePreferredStore must be used within a PreferredStoreProvider");
  return ctx;
}
