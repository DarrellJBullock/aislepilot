import type { ItemStatus } from "../types";

/** Allowed status transitions for a shopping-list item. */
const TRANSITIONS: Record<ItemStatus, ItemStatus[]> = {
  unmatched: ["matched"],
  matched: ["available", "unmatched", "collected", "unavailable", "skipped"],
  available: ["collected", "unavailable", "skipped", "matched"],
  collected: ["available", "matched", "purchased", "skipped"],
  unavailable: ["matched", "available", "skipped"],
  skipped: ["matched", "available"],
  purchased: [],
};

export function canTransition(from: ItemStatus, to: ItemStatus): boolean {
  if (from === to) return true;
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function nextStatus(from: ItemStatus, to: ItemStatus): ItemStatus {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid status transition: ${from} -> ${to}`);
  }
  return to;
}

/** Status an item takes when a product is matched to it. */
export function statusAfterMatch(): ItemStatus {
  return "available";
}

export function isResolved(status: ItemStatus): boolean {
  return (
    status === "collected" ||
    status === "unavailable" ||
    status === "skipped" ||
    status === "purchased"
  );
}
