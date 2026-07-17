import type { Product, ShoppingList, ShoppingListItem } from "../types";

/** Effective unit price: promo wins, then current, then regular. */
export function effectiveUnitPrice(product?: Product): number {
  if (!product) return 0;
  if (typeof product.promotionalPrice === "number") return product.promotionalPrice;
  if (typeof product.currentPrice === "number") return product.currentPrice;
  if (typeof product.regularPrice === "number") return product.regularPrice;
  return 0;
}

/** True when the product is discounted below its regular price. */
export function isOnSale(product?: Product): boolean {
  if (!product || typeof product.regularPrice !== "number") return false;
  return effectiveUnitPrice(product) < product.regularPrice;
}

export function itemSubtotal(item: ShoppingListItem): number {
  return round(effectiveUnitPrice(item.product) * Math.max(0, item.quantity));
}

const COUNTED_TOWARD_ESTIMATE: ShoppingListItem["status"][] = [
  "matched",
  "available",
  "collected",
  "purchased",
];

export interface ListTotals {
  estimatedTotal: number; // planned cost of all matched, non-skipped items
  collectedTotal: number; // cost of collected/purchased items
  remainingTotal: number; // estimated - collected
  budget?: number;
  budgetRemaining?: number; // budget - estimated
  overBudget: number; // max(0, estimated - budget)
}

export function computeTotals(list: ShoppingList): ListTotals {
  let estimatedTotal = 0;
  let collectedTotal = 0;

  for (const item of list.items) {
    if (!item.product) continue;
    if (!COUNTED_TOWARD_ESTIMATE.includes(item.status)) continue;
    const sub = itemSubtotal(item);
    estimatedTotal += sub;
    if (item.status === "collected" || item.status === "purchased") {
      collectedTotal += sub;
    }
  }

  estimatedTotal = round(estimatedTotal);
  collectedTotal = round(collectedTotal);
  const remainingTotal = round(estimatedTotal - collectedTotal);

  const totals: ListTotals = {
    estimatedTotal,
    collectedTotal,
    remainingTotal,
    overBudget: 0,
  };

  if (typeof list.budget === "number") {
    totals.budget = list.budget;
    totals.budgetRemaining = round(list.budget - estimatedTotal);
    totals.overBudget = round(Math.max(0, estimatedTotal - list.budget));
  }

  return totals;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function round(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
