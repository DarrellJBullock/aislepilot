import type { Product, ShoppingListItem } from "../types";
import { statusAfterMatch } from "../status";

/** Attach a matched product to an item and advance its status. */
export function assignProduct(
  item: ShoppingListItem,
  product: Product,
): ShoppingListItem {
  return {
    ...item,
    product,
    status: statusAfterMatch(),
    updatedAt: new Date().toISOString(),
  };
}

/** Replace a matched product, keeping quantity/notes; used for substitutions. */
export function replaceProduct(
  item: ShoppingListItem,
  product: Product,
): ShoppingListItem {
  return {
    ...item,
    product,
    status: item.status === "unavailable" ? "available" : item.status,
    updatedAt: new Date().toISOString(),
  };
}

/** Clear a match, returning the item to unmatched state. */
export function clearMatch(item: ShoppingListItem): ShoppingListItem {
  return {
    ...item,
    product: undefined,
    status: "unmatched",
    updatedAt: new Date().toISOString(),
  };
}

/** Suggest budget-trimming actions when a list exceeds its budget. */
export interface BudgetSuggestion {
  itemId: string;
  action: "reduce_quantity" | "cheaper_product" | "skip_low_priority";
  reason: string;
}

import { effectiveUnitPrice } from "../pricing";

export function budgetSuggestions(
  items: ShoppingListItem[],
  overBudget: number,
): BudgetSuggestion[] {
  if (overBudget <= 0) return [];
  const suggestions: BudgetSuggestion[] = [];

  // Low-priority items first — candidates to skip.
  for (const item of items) {
    if (!item.product) continue;
    if (item.priority === "low") {
      suggestions.push({
        itemId: item.id,
        action: "skip_low_priority",
        reason: `Skip "${item.rawText}" to save ${money(
          effectiveUnitPrice(item.product) * item.quantity,
        )}`,
      });
    }
  }

  // High-quantity items — candidates to reduce.
  for (const item of items) {
    if (!item.product || item.quantity <= 1) continue;
    suggestions.push({
      itemId: item.id,
      action: "reduce_quantity",
      reason: `Reduce "${item.rawText}" quantity to save ${money(
        effectiveUnitPrice(item.product),
      )} each`,
    });
  }

  // Most expensive matched items — candidates for a cheaper product.
  const priciest = [...items]
    .filter((i) => i.product)
    .sort((a, b) => effectiveUnitPrice(b.product) - effectiveUnitPrice(a.product))
    .slice(0, 2);
  for (const item of priciest) {
    suggestions.push({
      itemId: item.id,
      action: "cheaper_product",
      reason: `Pick a cheaper option for "${item.rawText}"`,
    });
  }

  return suggestions.slice(0, 5);
}

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}
