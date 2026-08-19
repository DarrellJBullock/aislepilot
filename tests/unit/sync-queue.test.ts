import { describe, it, expect, vi } from "vitest";
import { enqueue, drainQueue, type WriteOp } from "@aislepilot/domain/sync/queue";

const insertA: WriteOp = { table: "shopping_list_items", kind: "insert", rows: [{ id: "a" }] };
const updateA: WriteOp = { table: "shopping_list_items", kind: "update", recordId: "a", patch: { status: "collected" } };
const deleteB: WriteOp = { table: "shopping_list_items", kind: "delete", recordId: "b" };

describe("enqueue", () => {
  it("appends to the end, preserving order", () => {
    expect(enqueue([insertA], [updateA, deleteB])).toEqual([insertA, updateA, deleteB]);
  });
  it("is a no-op for an empty batch, returning the same reference", () => {
    const q = [insertA];
    expect(enqueue(q, [])).toBe(q);
  });
});

describe("drainQueue", () => {
  it("applies every op in order and empties the queue on full success", async () => {
    const execute = vi.fn().mockResolvedValue({ error: null });
    const remaining = await drainQueue([insertA, updateA, deleteB], execute);
    expect(remaining).toEqual([]);
    expect(execute).toHaveBeenNthCalledWith(1, insertA);
    expect(execute).toHaveBeenNthCalledWith(2, updateA);
    expect(execute).toHaveBeenNthCalledWith(3, deleteB);
  });

  it("stops at the first failed op, leaving it and everything after it queued", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce({ error: null }) // insertA succeeds
      .mockResolvedValueOnce({ error: "network error" }); // updateA fails
    const remaining = await drainQueue([insertA, updateA, deleteB], execute);
    expect(remaining).toEqual([updateA, deleteB]);
    expect(execute).toHaveBeenCalledTimes(2); // never even attempts deleteB
  });

  it("treats a thrown error the same as an { error } response", async () => {
    const execute = vi.fn().mockRejectedValueOnce(new Error("offline"));
    const remaining = await drainQueue([insertA, updateA], execute);
    expect(remaining).toEqual([insertA, updateA]);
  });

  it("returns an empty array for an empty queue without calling execute", async () => {
    const execute = vi.fn();
    expect(await drainQueue([], execute)).toEqual([]);
    expect(execute).not.toHaveBeenCalled();
  });
});
