// A durable write queue for Supabase mutations. Every list/item/member
// write goes through this instead of firing once and logging on failure
// (the old `run()` behavior) — offline or flaky-network writes now persist
// and retry, in order, instead of silently vanishing.
export type WriteOp =
  | { table: string; kind: "insert"; rows: object[] }
  | { table: string; kind: "update"; recordId: string; patch: object }
  | { table: string; kind: "delete"; recordId: string };

/** Appends ops to the end of the queue — order is the retry order. */
export function enqueue(queue: WriteOp[], ops: WriteOp[]): WriteOp[] {
  return ops.length ? [...queue, ...ops] : queue;
}

/**
 * Applies queued ops in order via `execute`, stopping at the first failure
 * (a thrown network error, or a Supabase `{ error }` response) so ops never
 * apply out of order — e.g. an item update can't land before the insert
 * that created it. Returns whatever's left in the queue: on full success
 * that's `[]`; on a failure partway through, the failed op and everything
 * after it (untouched, to retry from the same point next time).
 */
export async function drainQueue(
  queue: WriteOp[],
  execute: (op: WriteOp) => Promise<{ error: unknown }>,
): Promise<WriteOp[]> {
  let i = 0;
  for (; i < queue.length; i++) {
    try {
      const { error } = await execute(queue[i]);
      if (error) break;
    } catch {
      break;
    }
  }
  return queue.slice(i);
}
