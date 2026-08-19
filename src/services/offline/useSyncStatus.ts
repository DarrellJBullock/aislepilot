"use client";

import { useOnlineStatus } from "./useOnlineStatus";
import { useSyncQueue } from "@/lib/sync-queue";

export type SyncState = "synced" | "syncing" | "offline";

/** Reflects the real durable write queue (see @/lib/sync-queue): "offline"
 * when there's no network, "syncing" while writes are queued/draining,
 * "synced" once the queue is empty. */
export function useSyncStatus(): SyncState {
  const online = useOnlineStatus();
  const pending = useSyncQueue();
  if (!online) return "offline";
  return pending > 0 ? "syncing" : "synced";
}
