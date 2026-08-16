import { describe, it, expect } from "vitest";
import { computeProgress } from "@aislepilot/domain/progress";
import { makeItem, makeList, makeProduct } from "../factories";

describe("computeProgress", () => {
  it("ignores unmatched items in the total", () => {
    const list = makeList([
      makeItem({ id: "a", status: "available", product: makeProduct() }),
      makeItem({ id: "b", status: "unmatched" }),
    ]);
    const p = computeProgress(list);
    expect(p.total).toBe(1);
  });

  it("counts collected and resolved correctly", () => {
    const list = makeList([
      makeItem({ id: "a", status: "collected", product: makeProduct() }),
      makeItem({ id: "b", status: "skipped", product: makeProduct() }),
      makeItem({ id: "c", status: "available", product: makeProduct() }),
    ]);
    const p = computeProgress(list);
    expect(p.total).toBe(3);
    expect(p.collected).toBe(1);
    expect(p.resolved).toBe(2);
    expect(p.remaining).toBe(1);
    expect(p.percent).toBe(67);
  });

  it("is 0% for an empty list", () => {
    expect(computeProgress(makeList([])).percent).toBe(0);
  });
});
