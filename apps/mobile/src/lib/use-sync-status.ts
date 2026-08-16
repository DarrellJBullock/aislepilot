import { useEffect, useRef, useState } from "react";
import { useOnlineStatus } from "./use-online-status";

export type SyncState = "synced" | "syncing" | "offline";

/** Ported from the web app's useSyncStatus — same "syncing" pulse after a
 * change, "offline" whenever connectivity drops. */
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
