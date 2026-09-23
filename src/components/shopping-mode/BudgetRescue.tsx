"use client";

import { useEffect, useState } from "react";
import { TrendingDown } from "lucide-react";
import type { Product, ShoppingListItem } from "@aislepilot/domain/types";
import { effectiveUnitPrice, formatCurrency, isCheaperAlternative } from "@aislepilot/domain/pricing";
import { fetchProducts } from "@/lib/retailer-client";
import { Button } from "@/components/ui";

/**
 * Shown in Shopping Mode once the list is trending over budget: finds a
 * cheaper stand-in for the priciest item still left to collect (via the
 * same product search the manual "Choose a substitute" flow uses) and
 * offers a one-tap swap. Silent when no genuinely cheaper option exists.
 */
export function BudgetRescue({
  item,
  storeId,
  overBudget,
  onSwap,
}: {
  item: ShoppingListItem;
  storeId?: string;
  overBudget: number;
  onSwap: (product: Product) => void;
}) {
  const [alternative, setAlternative] = useState<Product | null>(null);
  const [dismissedItemId, setDismissedItemId] = useState<string | null>(null);
  const current = item.product;

  useEffect(() => {
    if (!current) return;
    let active = true;
    setAlternative(null);
    fetchProducts(item.rawText, storeId).then((res) => {
      if (!active) return;
      const cheapest = res.products
        .filter((p) => isCheaperAlternative(current, p))
        .sort((a, b) => effectiveUnitPrice(a) - effectiveUnitPrice(b))[0];
      setAlternative(cheapest ?? null);
    });
    return () => {
      active = false;
    };
  }, [item.id, item.rawText, storeId, current]);

  if (!current || !alternative || dismissedItemId === item.id) return null;

  const savings = (effectiveUnitPrice(current) - effectiveUnitPrice(alternative)) * item.quantity;

  return (
    <div className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <TrendingDown size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-amber-900">
          {formatCurrency(overBudget)} over budget — swap to save {formatCurrency(savings)}
        </p>
        <p className="mt-0.5 text-sm text-amber-800">
          Try <strong>{alternative.name}</strong> ({formatCurrency(effectiveUnitPrice(alternative))}) instead of{" "}
          {current.name} ({formatCurrency(effectiveUnitPrice(current))})
        </p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={() => onSwap(alternative)}>
            Swap it
          </Button>
          <button
            onClick={() => setDismissedItemId(item.id)}
            className="rounded-lg px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
