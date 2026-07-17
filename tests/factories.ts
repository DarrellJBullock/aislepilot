import type { Product, ShoppingList, ShoppingListItem } from "@/domain/types";

export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    retailer: "kroger",
    externalId: "ext-1",
    name: "Whole Milk",
    brand: "Kroger",
    category: "Milk",
    department: "Dairy",
    currency: "USD",
    availability: "in_stock",
    regularPrice: 4,
    currentPrice: 4,
    locationSource: "aislepilot_mapped",
    routeOrder: 60,
    ...overrides,
  };
}

export function makeItem(overrides: Partial<ShoppingListItem> = {}): ShoppingListItem {
  return {
    id: "i1",
    listId: "l1",
    rawText: "Milk",
    quantity: 1,
    priority: "normal",
    status: "unmatched",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeList(items: ShoppingListItem[], overrides: Partial<ShoppingList> = {}): ShoppingList {
  return {
    id: "l1",
    ownerId: "u1",
    name: "Test list",
    archived: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    items,
    members: [],
    ...overrides,
  };
}
