import { describe, it, expect } from "vitest";
import {
  effectiveUnitPrice,
  isOnSale,
  itemSubtotal,
  computeTotals,
  formatCurrency,
  getGroceryTaxRate,
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
