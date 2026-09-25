import type { Product, ShoppingList, ShoppingListItem } from "../types";
import { isResolved } from "../status";

// Approximate grocery sales tax rate by state (2-letter USPS code), for
// trip-total estimation only — not tax advice. Most US states exempt
// groceries from sales tax entirely (rate 0, and therefore omitted below).
// Two groups are listed:
//   - States that tax groceries at a reduced or full state rate.
//   - States that exempt groceries at the *state* level but where local
//     option taxes commonly still apply (GA, NC, VA) — these use a single
//     representative average rate since actual rates vary by locality.
//     A few similarly variable states (AZ, CO, LA) were left out entirely
//     rather than guess at an average that'd be wrong more often than right.
const GROCERY_TAX_RATE: Record<string, number> = {
  AL: 0.03,
  AR: 0.00125,
  GA: 0.03,
  HI: 0.04,
  ID: 0.06,
  IL: 0.01,
  MO: 0.01225,
  MS: 0.07,
  NC: 0.02,
  SD: 0.042,
  TN: 0.04,
  UT: 0.03,
  VA: 0.01,
};

/** 0 for states that exempt groceries from sales tax (most of them). */
export function getGroceryTaxRate(state?: string): number {
  if (!state) return 0;
  return GROCERY_TAX_RATE[state.trim().toUpperCase()] ?? 0;
}

// ---- Price freshness ----
// Kroger's terms don't let us keep long-lived copies of its data, so what we
// persist is a slim snapshot: enough to show and route the item, with prices
// only trusted for PRICE_TTL_MS after they were fetched. Older prices are
// dropped on read and re-fetched from Kroger when the list is opened.

export const PRICE_TTL_MS = 24 * 60 * 60 * 1000;

const PRICE_FIELDS = ["regularPrice", "currentPrice", "promotionalPrice"] as const;

export function hasCurrentPrice(product?: Product): boolean {
  return !!product && PRICE_FIELDS.some((f) => typeof product[f] === "number");
}

export function isPriceFresh(product: Product, nowMs = Date.now()): boolean {
  if (!product.pricedAt) return false;
  const t = Date.parse(product.pricedAt);
  return Number.isFinite(t) && nowMs - t < PRICE_TTL_MS;
}

/** A product without prices/availability — what we keep when no price is current. */
export function withoutPrices(product: Product): Product {
  const rest = { ...product };
  for (const f of PRICE_FIELDS) delete rest[f];
  delete rest.pricedAt;
  delete rest.sourceUpdatedAt;
  rest.availability = "unknown";
  return rest;
}

/** What we persist: drops fields we don't need (description, raw metadata). */
export function slimProduct(product: Product, nowIso = new Date().toISOString()): Product {
  const { description: _d, metadata: _m, ...rest } = product;
  void _d;
  void _m;
  const pricedAt = product.pricedAt ?? (hasCurrentPrice(product) ? nowIso : undefined);
  return pricedAt ? { ...rest, pricedAt } : rest;
}

/** True when a stored product has no price we can trust (missing or expired). */
export function needsPriceRefresh(product: Product | undefined, nowMs = Date.now()): boolean {
  return !!product && (!hasCurrentPrice(product) || !isPriceFresh(product, nowMs));
}

/** Applied to stored products on read: expired prices are discarded. */
export function dropStalePrices(product: Product, nowMs = Date.now()): Product {
  return isPriceFresh(product, nowMs) ? product : withoutPrices(product);
}

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
  taxRate: number; // 0 when the store's state exempts groceries
  estimatedTax: number;
  collectedTax: number;
  estimatedTotalWithTax: number;
  collectedTotalWithTax: number;
  /** Counted items with no current price (expired offline) — the total excludes them. */
  unpricedCount: number;
}

/** taxRate is the store's grocery tax rate — see getGroceryTaxRate(). 0 (the default) omits tax entirely. */
export function computeTotals(list: ShoppingList, taxRate = 0): ListTotals {
  let estimatedTotal = 0;
  let collectedTotal = 0;
  let unpricedCount = 0;

  for (const item of list.items) {
    if (!item.product) continue;
    if (!COUNTED_TOWARD_ESTIMATE.includes(item.status)) continue;
    if (!hasCurrentPrice(item.product)) unpricedCount++;
    const sub = itemSubtotal(item);
    estimatedTotal += sub;
    if (item.status === "collected" || item.status === "purchased") {
      collectedTotal += sub;
    }
  }

  estimatedTotal = round(estimatedTotal);
  collectedTotal = round(collectedTotal);
  const remainingTotal = round(estimatedTotal - collectedTotal);
  const estimatedTax = round(estimatedTotal * taxRate);
  const collectedTax = round(collectedTotal * taxRate);

  const totals: ListTotals = {
    estimatedTotal,
    collectedTotal,
    remainingTotal,
    overBudget: 0,
    taxRate,
    estimatedTax,
    collectedTax,
    estimatedTotalWithTax: round(estimatedTotal + estimatedTax),
    collectedTotalWithTax: round(collectedTotal + collectedTax),
    unpricedCount,
  };

  if (typeof list.budget === "number") {
    totals.budget = list.budget;
    totals.budgetRemaining = round(list.budget - estimatedTotal);
    totals.overBudget = round(Math.max(0, estimatedTotal - list.budget));
  }

  return totals;
}

/**
 * The single not-yet-resolved item most worth swapping for a cheaper
 * product — the priciest remaining (matched, unresolved) item, since
 * swapping it gives the biggest single saving. Undefined when there's no
 * such item. Callers decide *when* to act on this (e.g. only once
 * ListTotals.overBudget > 0) — this just picks which one.
 */
export function pickSwapCandidate(list: ShoppingList): ShoppingListItem | undefined {
  const candidates = list.items.filter((i) => i.product && !isResolved(i.status));
  if (candidates.length === 0) return undefined;
  return candidates.reduce((priciest, item) =>
    itemSubtotal(item) > itemSubtotal(priciest) ? item : priciest,
  );
}

/**
 * True when `alternative` is a genuinely cheaper stand-in for `current` —
 * a different product with a lower effective unit price.
 */
export function isCheaperAlternative(current: Product, alternative: Product): boolean {
  return alternative.id !== current.id && effectiveUnitPrice(alternative) < effectiveUnitPrice(current);
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
