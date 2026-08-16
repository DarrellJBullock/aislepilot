import { describe, it, expect } from "vitest";
import { MockKrogerProvider } from "@aislepilot/domain/providers/mock-kroger";

const provider = new MockKrogerProvider();

describe("MockKrogerProvider", () => {
  it("exposes non-live, unverified capabilities", () => {
    const caps = provider.getCapabilities();
    expect(caps.live).toBe(false);
    expect(caps.verifiedLocations).toBe(false);
    expect(caps.searchProducts).toBe(true);
  });

  it("returns three demo stores", async () => {
    const stores = await provider.searchStores({});
    expect(stores.length).toBe(3);
    expect(stores.every((s) => s.demo)).toBe(true);
  });

  it("normalizes products to the shared shape", async () => {
    const products = await provider.searchProducts({ query: "milk", storeId: "store-riverside" });
    expect(products.length).toBeGreaterThan(0);
    const p = products[0];
    expect(p.retailer).toBe("kroger");
    expect(p.currency).toBe("USD");
    expect(typeof p.externalId).toBe("string");
    expect(["in_stock", "limited", "out_of_stock", "unknown"]).toContain(p.availability);
    // Estimated locations must never claim retailer verification.
    expect(p.locationSource).not.toBe("retailer_verified");
  });

  it("varies price between stores", async () => {
    const a = await provider.getProduct("store-riverside:milk-whole-gal", "store-riverside");
    const b = await provider.getProduct("store-oak-hollow:milk-whole-gal", "store-oak-hollow");
    expect(a.currentPrice).not.toBe(b.currentPrice);
  });

  it("looks up a product by barcode", async () => {
    const product = await provider.lookupBarcode("001111041001", "store-riverside");
    expect(product?.externalId).toBe("milk-whole-gal");
  });

  it("returns null for an unknown barcode", async () => {
    expect(await provider.lookupBarcode("000000000000")).toBeNull();
  });

  it("reports availability for a store", async () => {
    const avail = await provider.getAvailability("store-riverside:salmon-fillet", "store-riverside");
    expect(avail.availability).toBe("out_of_stock");
  });
});
