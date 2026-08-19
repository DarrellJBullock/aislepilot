// Thin, stateful wrapper around @aislepilot/domain/sync/queue's pure logic:
// persists the queue to AsyncStorage (so a killed app doesn't lose queued
// writes) and drains it against a live Supabase client. See
// src/lib/sync-queue.ts on web for the same shape over localStorage.
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SupabaseClient } from "@supabase/supabase-js";
import { enqueue, drainQueue, type WriteOp } from "@aislepilot/domain/sync/queue";

const STORAGE_KEY = "aislepilot.sync-queue.v1";

let queue: WriteOp[] = [];
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue)).catch(() => {});
}

AsyncStorage.getItem(STORAGE_KEY)
  .then((raw) => {
    if (!raw) return;
    try {
      queue = JSON.parse(raw);
      notify();
    } catch {
      // corrupt storage — drop it rather than getting stuck
    }
  })
  .catch(() => {});

export function enqueueOps(ops: WriteOp[]) {
  if (!ops.length) return;
  queue = enqueue(queue, ops);
  persist();
  notify();
}

export function pendingCount(): number {
  return queue.length;
}

export function executeOp(db: SupabaseClient, op: WriteOp) {
  const q = db.from(op.table);
  if (op.kind === "insert") return q.insert(op.rows);
  if (op.kind === "update") return q.update(op.patch).eq("id", op.recordId);
  return q.delete().eq("id", op.recordId);
}

let flushing = false;
export async function flushQueue(db: SupabaseClient) {
  if (flushing || !queue.length) return;
  flushing = true;
  try {
    queue = await drainQueue(queue, (op) => Promise.resolve(executeOp(db, op)));
    persist();
    notify();
  } finally {
    flushing = false;
  }
}

/** Live pending-write count, for the sync status indicator. */
export function useSyncQueue(): number {
  const [, force] = useState(0);
  useEffect(() => {
    const listener = () => force((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return pendingCount();
}
