import { describe, it, expect } from "vitest";
import {
  effectiveUnitPrice,
  isOnSale,
  itemSubtotal,
  computeTotals,
  formatCurrency,
  getGroceryTaxRate,
  pickSwapCandidate,
  isCheaperAlternative,
  isPriceFresh,
  dropStalePrices,
  hasCurrentPrice,
  needsPriceRefresh,
  slimProduct,
  withoutPrices,
} from "@aislepilot/domain/pricing";
import { makeProduct, makeItem, makeList } from "../factories";

describe("effectiveUnitPrice", () => {
  it("prefers promotional over current over regular", () => {
    expect(
      effectiveUnitPrice(makeProduct({ regularPrice: 5, currentPrice: 4, promotionalPrice: 3 })),
    ).toBe(3);
    expect(effectiveUnitPrice(makeProduct({ regularPrice: 5, currentPrice: 4, promotionalPrice: undefined }))).toBe(4);
    expect(effectiveUnitPrice(makeProduct({ regularPrice: 5, currentPrice: undefined, promotionalPrice: undefined }))).toBe(5);
  });

  it("returns 0 for no product", () => {
    expect(effectiveUnitPrice(undefined)).toBe(0);
  });
});

describe("isOnSale", () => {
  it("is true when effective price is below regular", () => {
    expect(isOnSale(makeProduct({ regularPrice: 5, promotionalPrice: 3 }))).toBe(true);
  });
  it("is false at regular price", () => {
    expect(isOnSale(makeProduct({ regularPrice: 5, currentPrice: 5 }))).toBe(false);
  });
});

describe("itemSubtotal", () => {
  it("multiplies price by quantity", () => {
    const item = makeItem({ quantity: 3, status: "available", product: makeProduct({ currentPrice: 2.5 }) });
    expect(itemSubtotal(item)).toBe(7.5);
  });
  it("is 0 without a product", () => {
    expect(itemSubtotal(makeItem({ quantity: 4 }))).toBe(0);
  });
});

describe("computeTotals", () => {
  it("sums estimated, collected and remaining", () => {
    const list = makeList([
      makeItem({ id: "a", status: "available", quantity: 2, product: makeProduct({ currentPrice: 3 }) }),
      makeItem({ id: "b", status: "collected", quantity: 1, product: makeProduct({ currentPrice: 4 }) }),
      makeItem({ id: "c", status: "unmatched" }),
    ]);
    const t = computeTotals(list);
    expect(t.estimatedTotal).toBe(10);
    expect(t.collectedTotal).toBe(4);
    expect(t.remainingTotal).toBe(6);
  });

  it("excludes skipped and unavailable items from the estimate", () => {
    const list = makeList([
      makeItem({ id: "a", status: "available", product: makeProduct({ currentPrice: 3 }) }),
      makeItem({ id: "b", status: "skipped", product: makeProduct({ currentPrice: 9 }) }),
      makeItem({ id: "c", status: "unavailable", product: makeProduct({ currentPrice: 9 }) }),
    ]);
    expect(computeTotals(list).estimatedTotal).toBe(3);
  });

  it("computes budget remaining and over-budget", () => {
    const list = makeList(
      [makeItem({ id: "a", status: "available", quantity: 2, product: makeProduct({ currentPrice: 30 }) })],
      { budget: 50 },
    );
    const t = computeTotals(list);
    expect(t.estimatedTotal).toBe(60);
    expect(t.budgetRemaining).toBe(-10);
    expect(t.overBudget).toBe(10);
  });

  it("reports no over-budget when within budget", () => {
    const list = makeList(
      [makeItem({ id: "a", status: "available", product: makeProduct({ currentPrice: 20 }) })],
      { budget: 50 },
    );
    const t = computeTotals(list);
    expect(t.overBudget).toBe(0);
    expect(t.budgetRemaining).toBe(30);
  });
});

describe("pickSwapCandidate", () => {
  it("picks the priciest not-yet-resolved item", () => {
    const list = makeList([
      makeItem({ id: "a", status: "available", product: makeProduct({ currentPrice: 3 }) }),
      makeItem({ id: "b", status: "available", product: makeProduct({ currentPrice: 9 }) }),
      makeItem({ id: "c", status: "matched", product: makeProduct({ currentPrice: 5 }) }),
    ]);
    expect(pickSwapCandidate(list)?.id).toBe("b");
  });

  it("ignores collected, skipped, unavailable, and purchased items", () => {
    const list = makeList([
      makeItem({ id: "a", status: "collected", product: makeProduct({ currentPrice: 99 }) }),
      makeItem({ id: "b", status: "skipped", product: makeProduct({ currentPrice: 99 }) }),
      makeItem({ id: "c", status: "unavailable", product: makeProduct({ currentPrice: 99 }) }),
      makeItem({ id: "d", status: "purchased", product: makeProduct({ currentPrice: 99 }) }),
      makeItem({ id: "e", status: "available", product: makeProduct({ currentPrice: 2 }) }),
    ]);
    expect(pickSwapCandidate(list)?.id).toBe("e");
  });

  it("ignores unmatched items (no product)", () => {
    const list = makeList([makeItem({ id: "a", status: "unmatched" })]);
    expect(pickSwapCandidate(list)).toBeUndefined();
  });

  it("is undefined when there's nothing swappable", () => {
    const list = makeList([makeItem({ id: "a", status: "collected", product: makeProduct() })]);
    expect(pickSwapCandidate(list)).toBeUndefined();
  });
});

describe("isCheaperAlternative", () => {
  it("is true for a different, cheaper product", () => {
    const current = makeProduct({ id: "p1", currentPrice: 5 });
    const alt = makeProduct({ id: "p2", currentPrice: 3 });
    expect(isCheaperAlternative(current, alt)).toBe(true);
  });

  it("is false for the same product", () => {
    const current = makeProduct({ id: "p1", currentPrice: 5 });
    expect(isCheaperAlternative(current, current)).toBe(false);
  });

  it("is false when the alternative isn't actually cheaper", () => {
    const current = makeProduct({ id: "p1", currentPrice: 5 });
    const alt = makeProduct({ id: "p2", currentPrice: 5 });
    expect(isCheaperAlternative(current, alt)).toBe(false);
  });

  it("respects promotional pricing on both sides", () => {
    const current = makeProduct({ id: "p1", regularPrice: 10, promotionalPrice: 4 });
    const alt = makeProduct({ id: "p2", regularPrice: 6, currentPrice: 6 });
    // current's effective price (promo 4) is already cheaper than alt (6)
    expect(isCheaperAlternative(current, alt)).toBe(false);
  });
});

describe("formatCurrency", () => {
  it("formats USD", () => {
    expect(formatCurrency(3.5)).toBe("$3.50");
  });
});

describe("getGroceryTaxRate", () => {
  it("is 0 for states that exempt groceries", () => {
    expect(getGroceryTaxRate("OH")).toBe(0);
    expect(getGroceryTaxRate("CA")).toBe(0);
  });
  it("is 0 for no state", () => {
    expect(getGroceryTaxRate(undefined)).toBe(0);
  });
  it("returns the rate for states that tax groceries", () => {
    expect(getGroceryTaxRate("TN")).toBe(0.04);
    expect(getGroceryTaxRate("MS")).toBe(0.07);
  });
  it("is case-insensitive", () => {
    expect(getGroceryTaxRate("tn")).toBe(0.04);
  });
  it("returns a representative local rate for states that exempt at the state level but tax locally", () => {
    expect(getGroceryTaxRate("GA")).toBe(0.03);
    expect(getGroceryTaxRate("NC")).toBe(0.02);
    expect(getGroceryTaxRate("VA")).toBe(0.01);
  });
  it("is 0 for highly variable local-tax states left out of the table", () => {
    expect(getGroceryTaxRate("AZ")).toBe(0);
    expect(getGroceryTaxRate("CO")).toBe(0);
    expect(getGroceryTaxRate("LA")).toBe(0);
  });
});

describe("computeTotals with tax", () => {
  it("adds no tax by default", () => {
    const list = makeList([
      makeItem({ id: "a", status: "available", product: makeProduct({ currentPrice: 10 }) }),
    ]);
    const t = computeTotals(list);
    expect(t.taxRate).toBe(0);
    expect(t.estimatedTax).toBe(0);
    expect(t.estimatedTotalWithTax).toBe(10);
  });

  it("applies the given tax rate to estimated and collected totals", () => {
    const list = makeList([
      makeItem({ id: "a", status: "collected", product: makeProduct({ currentPrice: 10 }) }),
      makeItem({ id: "b", status: "available", product: makeProduct({ currentPrice: 20 }) }),
    ]);
    const t = computeTotals(list, 0.07);
    expect(t.estimatedTotal).toBe(30);
    expect(t.collectedTotal).toBe(10);
    expect(t.estimatedTax).toBe(2.1);
    expect(t.collectedTax).toBe(0.7);
    expect(t.estimatedTotalWithTax).toBe(32.1);
    expect(t.collectedTotalWithTax).toBe(10.7);
  });
});

describe("price freshness", () => {
  const NOW = Date.parse("2026-09-25T12:00:00.000Z");
  const hoursAgo = (h: number) => new Date(NOW - h * 3600_000).toISOString();

  it("trusts a price for 24 hours, then not", () => {
    expect(isPriceFresh(makeProduct({ pricedAt: hoursAgo(23) }), NOW)).toBe(true);
    expect(isPriceFresh(makeProduct({ pricedAt: hoursAgo(25) }), NOW)).toBe(false);
    expect(isPriceFresh(makeProduct({ pricedAt: undefined }), NOW)).toBe(false);
    expect(isPriceFresh(makeProduct({ pricedAt: "garbage" }), NOW)).toBe(false);
  });

  it("dropStalePrices keeps fresh products and strips expired ones", () => {
    const fresh = makeProduct({ pricedAt: hoursAgo(1) });
    expect(dropStalePrices(fresh, NOW)).toBe(fresh);

    const stale = dropStalePrices(
      makeProduct({ pricedAt: hoursAgo(30), promotionalPrice: 3 }),
      NOW,
    );
    expect(hasCurrentPrice(stale)).toBe(false);
    expect(stale.availability).toBe("unknown");
    expect(stale.pricedAt).toBeUndefined();
    expect(stale.name).toBe("Whole Milk"); // identity survives
  });

  it("slimProduct drops description/metadata and stamps pricedAt only when priced", () => {
    const slim = slimProduct(
      makeProduct({ description: "Whole Milk", metadata: { itemId: "x" } }),
      "2026-09-25T12:00:00.000Z",
    );
    expect(slim).not.toHaveProperty("description");
    expect(slim).not.toHaveProperty("metadata");
    expect(slim.pricedAt).toBe("2026-09-25T12:00:00.000Z");

    // an existing timestamp is never extended
    expect(slimProduct(makeProduct({ pricedAt: hoursAgo(20) })).pricedAt).toBe(hoursAgo(20));
    // nothing to stamp when there's no price
    expect(slimProduct(withoutPrices(makeProduct())).pricedAt).toBeUndefined();
  });

  it("needsPriceRefresh flags missing or expired prices", () => {
    expect(needsPriceRefresh(makeProduct({ pricedAt: hoursAgo(1) }), NOW)).toBe(false);
    expect(needsPriceRefresh(makeProduct({ pricedAt: hoursAgo(48) }), NOW)).toBe(true);
    expect(needsPriceRefresh(withoutPrices(makeProduct()), NOW)).toBe(true);
    expect(needsPriceRefresh(undefined, NOW)).toBe(false);
  });

  it("computeTotals counts items with no current price", () => {
    const list = makeList([
      makeItem({ id: "a", status: "matched", product: makeProduct({ pricedAt: hoursAgo(1) }) }),
      makeItem({ id: "b", status: "matched", product: withoutPrices(makeProduct({ id: "p2" })) }),
      makeItem({ id: "c", status: "skipped", product: withoutPrices(makeProduct({ id: "p3" })) }),
    ]);
    const totals = computeTotals(list);
    expect(totals.unpricedCount).toBe(1); // skipped items don't count
    expect(totals.estimatedTotal).toBe(4);
  });
});
