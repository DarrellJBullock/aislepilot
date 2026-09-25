import { describe, it, expect } from "vitest";
import { itemToRow, rowToItem } from "@aislepilot/domain/store/supabase-map";
import { refreshProducts, type AppState } from "@aislepilot/domain/store/state";
import { MockKrogerProvider } from "@aislepilot/domain/providers/mock-kroger";
import { mapProduct } from "@aislepilot/domain/providers/kroger-map";
import { makeProduct, makeItem, makeList } from "../factories";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

describe("persisted product snapshots", () => {
  it("writes a slim product: no description or metadata", () => {
    const row = itemToRow(
      makeItem({
        status: "matched",
        product: makeProduct({ description: "Whole Milk", metadata: { itemId: "x" }, pricedAt: hoursAgo(1) }),
      }),
    );
    expect(row.product).not.toHaveProperty("description");
    expect(row.product).not.toHaveProperty("metadata");
    expect(row.product?.name).toBe("Whole Milk");
  });

  it("drops expired prices when reading a row back", () => {
    const stale = rowToItem({
      ...itemToRow(makeItem({ status: "matched", product: makeProduct({ pricedAt: hoursAgo(30) }) })),
    });
    expect(stale.product?.currentPrice).toBeUndefined();
    expect(stale.product?.name).toBe("Whole Milk");

    const fresh = rowToItem({
      ...itemToRow(makeItem({ status: "matched", product: makeProduct({ pricedAt: hoursAgo(2) }) })),
    });
    expect(fresh.product?.currentPrice).toBe(4);
  });

  it("legacy rows with no pricedAt lose their prices", () => {
    const item = rowToItem({
      ...itemToRow(makeItem({ status: "matched", product: makeProduct() })),
      product: makeProduct(), // as stored before this change: prices, no pricedAt
    });
    expect(item.product?.currentPrice).toBeUndefined();
  });
});

describe("refreshProducts", () => {
  const state = {
    lists: [
      makeList([
        makeItem({ id: "a", status: "matched", product: makeProduct({ id: "s:1", currentPrice: 1, regularPrice: 1 }) }),
        makeItem({ id: "b", status: "matched", product: makeProduct({ id: "s:2", currentPrice: 9, regularPrice: 9 }) }),
      ]),
    ],
  } as unknown as AppState;

  it("updates price, availability and freshness for matching products only", () => {
    const next = refreshProducts(state, "l1", [
      makeProduct({ id: "s:1", currentPrice: 2.5, regularPrice: 3, promotionalPrice: 2.5, availability: "limited", pricedAt: hoursAgo(0) }),
    ]);
    const [a, b] = next.lists[0].items;
    expect(a.product).toMatchObject({ currentPrice: 2.5, regularPrice: 3, availability: "limited", name: "Whole Milk" });
    expect(a.product?.pricedAt).toBeTruthy();
    expect(b.product?.currentPrice).toBe(9); // untouched
  });

  it("is a no-op with nothing fresh", () => {
    expect(refreshProducts(state, "l1", [])).toBe(state);
  });
});

describe("live product mapping", () => {
  it("stamps pricedAt and keeps no raw description/metadata", () => {
    const p = mapProduct(
      {
        productId: "0001",
        upc: "0001",
        brand: "Kroger",
        categories: ["Dairy"],
        description: "2% Milk",
        items: [{ itemId: "x", size: "1 gal", price: { regular: 3.99, promo: 0 } }],
      },
      "store1",
    );
    expect(p.pricedAt).toBeTruthy();
    expect(p).not.toHaveProperty("description");
    expect(p).not.toHaveProperty("metadata");
    expect(p.name).toBe("2% Milk");
  });
});

describe("MockKrogerProvider.getProducts", () => {
  it("returns known products and skips unknown ids", async () => {
    const mock = new MockKrogerProvider();
    const [store] = await mock.searchStores({ query: "" });
    const [first] = await mock.searchProducts({ query: "milk", storeId: store.id });
    const got = await mock.getProducts([first.id, "nope"], store.id);
    expect(got.map((p) => p.id)).toEqual([first.id]);
  });
});
