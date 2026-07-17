import type { Availability, Product, Store } from "@/domain/types";
import { DEPARTMENTS, departmentRouteOrder } from "./departments";
import { BASE_PRODUCTS, type BaseProduct } from "./products";

// Three fictional demo stores with different price levels, promotions and
// availability. Addresses are fictional and clearly marked as demo data.
interface StoreConfig {
  id: string;
  banner: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  priceFactor: number; // multiplies regular price
  promoEvery: number; // every Nth product is on promotion
  outOfStock: string[]; // externalIds unavailable at this store
  limited: string[]; // externalIds with limited availability
}

const STORE_CONFIGS: StoreConfig[] = [
  {
    id: "store-riverside",
    banner: "Kroger",
    name: "Kroger — Riverside Commons (Demo)",
    address: "1200 Riverside Commons Dr",
    city: "Fairview",
    state: "OH",
    zip: "43021",
    priceFactor: 1.0,
    promoEvery: 4,
    outOfStock: ["salmon-fillet", "bread-multigrain"],
    limited: ["strawberries", "eggs-cage-free"],
  },
  {
    id: "store-oak-hollow",
    banner: "Ralphs",
    name: "Ralphs — Oak Hollow Center (Demo)",
    address: "88 Oak Hollow Center",
    city: "Westbrook",
    state: "CA",
    zip: "90210",
    priceFactor: 1.12,
    promoEvery: 5,
    outOfStock: ["frozen-pizza"],
    limited: ["chicken-breast", "paper-towels-6"],
  },
  {
    id: "store-pine-market",
    banner: "Fred Meyer",
    name: "Fred Meyer — Pine Market (Demo)",
    address: "540 Pine Market Ave",
    city: "Cedar Falls",
    state: "OR",
    zip: "97401",
    priceFactor: 0.94,
    promoEvery: 3,
    outOfStock: ["shrimp"],
    limited: ["ice-cream"],
  },
];

export const MOCK_STORES: Store[] = STORE_CONFIGS.map((c) => ({
  id: c.id,
  retailer: "kroger",
  name: c.name,
  banner: c.banner,
  address: c.address,
  city: c.city,
  state: c.state,
  zip: c.zip,
  demo: true,
  departments: DEPARTMENTS,
}));

function priceRound(n: number): number {
  // Snap to a realistic X.X9 / X.X price ending.
  return Math.round(n * 100) / 100;
}

function availabilityFor(base: BaseProduct, config: StoreConfig): Availability {
  if (config.outOfStock.includes(base.externalId)) return "out_of_stock";
  if (config.limited.includes(base.externalId)) return "limited";
  return base.baseAvailability ?? "in_stock";
}

function buildProduct(
  base: BaseProduct,
  config: StoreConfig,
  index: number,
): Product {
  const regular = priceRound(base.regularPrice * config.priceFactor);
  const onPromo = index % config.promoEvery === 0;
  const currentPrice = regular;
  const promotionalPrice = onPromo ? priceRound(regular * 0.82) : undefined;
  const availability = availabilityFor(base, config);

  return {
    id: `${config.id}:${base.externalId}`,
    retailer: "kroger",
    externalId: base.externalId,
    name: base.name,
    brand: base.brand,
    category: base.category,
    department: base.department,
    upc: base.upc,
    size: base.size,
    regularPrice: regular,
    currentPrice,
    promotionalPrice,
    currency: "USD",
    availability,
    storeId: config.id,
    aisle: base.aisle,
    section: base.section,
    locationSource: base.locationSource,
    routeOrder: departmentRouteOrder(base.department),
    sourceUpdatedAt: "2026-07-01T08:00:00.000Z",
    metadata: { demo: true },
  };
}

const CATALOGS: Record<string, Product[]> = Object.fromEntries(
  STORE_CONFIGS.map((config) => [
    config.id,
    BASE_PRODUCTS.map((base, i) => buildProduct(base, config, i)),
  ]),
);

export function catalogForStore(storeId: string): Product[] {
  return CATALOGS[storeId] ?? [];
}

export function allMockProducts(): Product[] {
  return Object.values(CATALOGS).flat();
}

export function findStore(storeId: string): Store | undefined {
  return MOCK_STORES.find((s) => s.id === storeId);
}
