"use client";

// Thin, stateful wrapper around @aislepilot/domain/sync/queue's pure logic:
// persists the queue to localStorage (so a closed tab doesn't lose queued
// writes) and drains it against a live Supabase client. See
// apps/mobile/src/lib/sync-queue.ts for the same shape over AsyncStorage.
import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { enqueue, drainQueue, type WriteOp } from "@aislepilot/domain/sync/queue";

const STORAGE_KEY = "aislepilot.sync-queue.v1";

function loadInitialQueue(): WriteOp[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

let queue: WriteOp[] = loadInitialQueue();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // storage unavailable (private mode, quota) — queue still works in-memory
  }
}

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
