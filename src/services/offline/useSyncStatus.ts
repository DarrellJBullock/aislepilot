"use client";

import { useEffect, useRef, useState } from "react";
import { useOnlineStatus } from "./useOnlineStatus";

export type SyncState = "synced" | "syncing" | "offline";

/**
 * Simulated sync indicator. Local writes persist immediately (localStorage);
 * this reflects a brief "syncing" pulse after each change and an "offline"
 * state when the network drops. The abstraction mirrors how a Supabase-backed
 * sync would surface status to the UI.
 */
export function useSyncStatus(dep: unknown): SyncState {
  const online = useOnlineStatus();
  const [state, setState] = useState<SyncState>("synced");
  const first = useRef(true);

  useEffect(() => {
    if (!online) {
      setState("offline");
      return;
    }
    if (first.current) {
      first.current = false;
      setState("synced");
      return;
    }
    setState("syncing");
    const t = setTimeout(() => setState("synced"), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep, online]);

  return online ? state : "offline";
}
