// Map Kroger Public API payloads to AislePilot's normalized domain models.
import type {
  Availability,
  LocationSource,
  Product,
  Store,
} from "../types";
import { DEPARTMENTS, departmentRouteOrder } from "../mock/departments";
import type {
  KrogerAisleLocation,
  KrogerImage,
  KrogerItem,
  KrogerLocation,
  KrogerProduct,
} from "./kroger-types";

// Kroger's Locations API also returns internal logistics nodes (delivery
// "Spokes", warehouses, forecast sheds, and cancelled ones) that aren't
// places a shopper can walk into.
const NON_STORE_NAME = /\b(spoke|warehouse|forecast shed|hub)\b/i;

/** False for logistics nodes that Kroger's Locations API lists like stores. */
export function isRealStore(loc: KrogerLocation): boolean {
  return !NON_STORE_NAME.test(loc.name ?? "");
}

export function mapStore(loc: KrogerLocation): Store {
  const addr = loc.address ?? {};
  return {
    id: loc.locationId,
    retailer: "kroger",
    name: loc.name ?? `${loc.chain ?? "Kroger"} — ${addr.city ?? ""}`.trim(),
    banner: loc.chain ?? "Kroger",
    address: addr.addressLine1 ?? "",
    city: addr.city ?? "",
    state: addr.state ?? "",
    zip: addr.zipCode ?? "",
    demo: false,
    departments:
      loc.departments && loc.departments.length
        ? loc.departments.map((d, i) => ({
            id: d.departmentId ?? `dept-${i}`,
            name: d.name ?? `Department ${i + 1}`,
            routeOrder: departmentRouteOrder(d.name ?? "") || (i + 1) * 10,
          }))
        : DEPARTMENTS,
  };
}

function mapAvailability(stockLevel?: string): Availability {
  switch (stockLevel) {
    case "HIGH":
      return "in_stock";
    case "LOW":
      return "limited";
    case "TEMPORARILY_OUT_OF_STOCK":
      return "out_of_stock";
    default:
      return "unknown";
  }
}

function pickImage(images?: KrogerImage[]): string | undefined {
  if (!images?.length) return undefined;
  const featured = images.find((i) => i.featured) ?? images[0];
  const sizes = featured.sizes ?? [];
  const preferred =
    sizes.find((s) => s.size === "large") ??
    sizes.find((s) => s.size === "medium") ??
    sizes[0];
  return preferred?.url;
}

function mapLocation(aisle?: KrogerAisleLocation): {
  aisle?: string;
  section?: string;
  locationSource: LocationSource;
} {
  // aisleLocations are returned by Kroger for the requested store — these are
  // retailer-verified. Absent aisle data falls back to a category estimate.
  if (aisle && (aisle.number || aisle.description)) {
    return {
      aisle: aisle.number || undefined,
      section: aisle.description || undefined,
      locationSource: "retailer_verified",
    };
  }
  return { locationSource: "category_estimate" };
}

export function mapProduct(p: KrogerProduct, storeId?: string): Product {
  const item: KrogerItem = p.items?.[0] ?? {};
  const price = item.price ?? {};
  const department = p.categories?.[0];
  const loc = mapLocation(p.aisleLocations?.[0]);

  const regularPrice = price.regular && price.regular > 0 ? price.regular : undefined;
  const promotionalPrice = price.promo && price.promo > 0 ? price.promo : undefined;

  return {
    id: storeId ? `${storeId}:${p.productId}` : p.productId,
    retailer: "kroger",
    externalId: p.productId,
    name: p.description ?? p.brand ?? "Product",
    brand: p.brand,
    category: p.categories?.[0],
    department,
    imageUrl: pickImage(p.images),
    upc: p.upc,
    size: item.size,
    regularPrice,
    currentPrice: regularPrice,
    promotionalPrice,
    currency: "USD",
    availability: mapAvailability(item.inventory?.stockLevel),
    storeId,
    aisle: loc.aisle,
    section: loc.section,
    locationSource: loc.locationSource,
    routeOrder: department ? departmentRouteOrder(department) : undefined,
    pricedAt: new Date().toISOString(),
  };
}
