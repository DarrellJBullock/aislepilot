import type { ShoppingList, ShoppingListItem } from "../types";

const DONE: ShoppingListItem["status"][] = [
  "collected",
  "unavailable",
  "skipped",
  "purchased",
];

export interface Progress {
  total: number; // active items (not skipped/unavailable excluded? we count all active)
  collected: number;
  remaining: number;
  resolved: number; // collected + unavailable + skipped + purchased
  percent: number; // 0-100 based on resolved / total
}

/** An item is "active" for a trip unless it was never matched. */
function isActive(item: ShoppingListItem): boolean {
  return item.status !== "unmatched";
}

export function computeProgress(list: ShoppingList): Progress {
  const active = list.items.filter(isActive);
  const total = active.length;
  const collected = active.filter(
    (i) => i.status === "collected" || i.status === "purchased",
  ).length;
  const resolved = active.filter((i) => DONE.includes(i.status)).length;
  const remaining = total - resolved;
  const percent = total === 0 ? 0 : Math.round((resolved / total) * 100);
  return { total, collected, remaining, resolved, percent };
}
