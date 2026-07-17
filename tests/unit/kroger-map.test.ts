import { describe, it, expect } from "vitest";
import { mapProduct, mapStore } from "@/providers/kroger-map";
import type { KrogerLocation, KrogerProduct } from "@/providers/kroger-types";

describe("mapStore", () => {
  it("normalizes a Kroger location", () => {
    const loc: KrogerLocation = {
      locationId: "01400943",
      chain: "KROGER",
      name: "Kroger Main St",
      address: { addressLine1: "100 Main St", city: "Cincinnati", state: "OH", zipCode: "45202" },
      departments: [{ departmentId: "d1", name: "Produce" }],
    };
    const store = mapStore(loc);
    expect(store.id).toBe("01400943");
    expect(store.banner).toBe("KROGER");
    expect(store.demo).toBe(false);
    expect(store.zip).toBe("45202");
    expect(store.departments[0].name).toBe("Produce");
  });
});

describe("mapProduct", () => {
  const base: KrogerProduct = {
    productId: "0001111041700",
    upc: "0001111041700",
    brand: "Kroger",
    categories: ["Dairy"],
    description: "2% Reduced Fat Milk",
    items: [{ itemId: "x", size: "1 gal", price: { regular: 3.99, promo: 0 }, inventory: { stockLevel: "HIGH" } }],
    images: [
      { featured: true, sizes: [{ size: "medium", url: "https://img/med.jpg" }, { size: "large", url: "https://img/lg.jpg" }] },
    ],
  };

  it("normalizes price, availability and image", () => {
    const p = mapProduct(base, "01400943");
    expect(p.id).toBe("01400943:0001111041700");
    expect(p.externalId).toBe("0001111041700");
    expect(p.currency).toBe("USD");
    expect(p.regularPrice).toBe(3.99);
    expect(p.promotionalPrice).toBeUndefined();
    expect(p.availability).toBe("in_stock");
    expect(p.imageUrl).toBe("https://img/lg.jpg");
    expect(p.department).toBe("Dairy");
  });

  it("uses promo price when present and maps low stock", () => {
    const p = mapProduct(
      { ...base, items: [{ price: { regular: 3.99, promo: 2.99 }, inventory: { stockLevel: "LOW" } }] },
      "01400943",
    );
    expect(p.promotionalPrice).toBe(2.99);
    expect(p.availability).toBe("limited");
  });

  it("maps temporarily out of stock", () => {
    const p = mapProduct(
      { ...base, items: [{ inventory: { stockLevel: "TEMPORARILY_OUT_OF_STOCK" } }] },
      "01400943",
    );
    expect(p.availability).toBe("out_of_stock");
  });

  it("marks aisle data from the store as retailer_verified", () => {
    const p = mapProduct(
      { ...base, aisleLocations: [{ number: "12", description: "Dairy Aisle" }] },
      "01400943",
    );
    expect(p.locationSource).toBe("retailer_verified");
    expect(p.aisle).toBe("12");
    expect(p.section).toBe("Dairy Aisle");
  });

  it("falls back to category estimate without aisle data", () => {
    const p = mapProduct(base, "01400943");
    expect(p.locationSource).toBe("category_estimate");
  });

  it("treats unknown stock level as unknown", () => {
    const p = mapProduct({ ...base, items: [{}] }, "01400943");
    expect(p.availability).toBe("unknown");
  });
});
