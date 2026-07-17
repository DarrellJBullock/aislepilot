import { describe, it, expect } from "vitest";
import { sortItems, groupByDepartment } from "@/domain/routing";
import { findStore } from "@/data/mock/stores";
import { makeItem, makeProduct } from "../factories";

const store = findStore("store-riverside");

const produce = makeItem({
  id: "produce",
  status: "available",
  product: makeProduct({ department: "Produce", routeOrder: 10, currentPrice: 1 }),
});
const dairy = makeItem({
  id: "dairy",
  status: "available",
  product: makeProduct({ department: "Dairy", routeOrder: 60, currentPrice: 9 }),
});
const household = makeItem({
  id: "household",
  status: "available",
  product: makeProduct({ department: "Household", routeOrder: 100, currentPrice: 5 }),
});

describe("sortItems", () => {
  it("orders by store route", () => {
    const sorted = sortItems([household, dairy, produce], "route", store);
    expect(sorted.map((i) => i.id)).toEqual(["produce", "dairy", "household"]);
  });

  it("orders by price descending", () => {
    const sorted = sortItems([produce, dairy, household], "price", store);
    expect(sorted.map((i) => i.id)).toEqual(["dairy", "household", "produce"]);
  });

  it("orders by name", () => {
    const a = makeItem({ id: "a", rawText: "Apples" });
    const z = makeItem({ id: "z", rawText: "Zucchini" });
    expect(sortItems([z, a], "name").map((i) => i.id)).toEqual(["a", "z"]);
  });
});

describe("groupByDepartment", () => {
  it("groups items in route order", () => {
    const groups = groupByDepartment([household, produce, dairy], store);
    expect(groups.map((g) => g.department)).toEqual(["Produce", "Dairy", "Household"]);
    expect(groups[0].items).toHaveLength(1);
  });
});
