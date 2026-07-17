// AislePilot shared domain models. Pure types — safe to reuse in a future
// React Native app. No runtime dependencies.

export type RetailerId = "kroger";
export type Currency = "USD";

export type Availability = "in_stock" | "limited" | "out_of_stock" | "unknown";

export type LocationSource =
  | "retailer_verified"
  | "aislepilot_mapped"
  | "community_verified"
  | "category_estimate"
  | "unknown";

export type ItemStatus =
  | "unmatched"
  | "matched"
  | "available"
  | "collected"
  | "unavailable"
  | "skipped"
  | "purchased";

export type ItemPriority = "low" | "normal" | "high";

export interface User {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface Retailer {
  id: RetailerId;
  name: string;
  demo: boolean;
}

export interface StoreDepartment {
  id: string;
  name: string;
  routeOrder: number;
}

export interface StoreLocation {
  department: string;
  aisle?: string;
  section?: string;
  routeOrder: number;
  locationSource: LocationSource;
}

export interface Store {
  id: string;
  retailer: RetailerId;
  name: string;
  banner: string; // e.g. "Kroger", "Ralphs"
  address: string;
  city: string;
  state: string;
  zip: string;
  demo: boolean;
  departments: StoreDepartment[];
}

export interface ProductPrice {
  regularPrice?: number;
  currentPrice?: number;
  promotionalPrice?: number;
  currency: Currency;
}

export interface ProductAvailability {
  productId: string;
  storeId: string;
  availability: Availability;
  sourceUpdatedAt?: string;
}

export interface Product {
  id: string;
  retailer: RetailerId;
  externalId: string;
  name: string;
  brand?: string;
  description?: string;
  category?: string;
  department?: string;
  imageUrl?: string;
  upc?: string;
  size?: string;
  regularPrice?: number;
  currentPrice?: number;
  promotionalPrice?: number;
  currency: Currency;
  availability: Availability;
  storeId?: string;
  aisle?: string;
  section?: string;
  locationSource: LocationSource;
  routeOrder?: number;
  sourceUpdatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ShoppingListItem {
  id: string;
  listId: string;
  rawText: string; // "Milk"
  quantity: number;
  notes?: string;
  priority: ItemPriority;
  status: ItemStatus;
  product?: Product; // matched product snapshot
  substituteFor?: string; // item id this substitutes
  collectedBy?: string; // member display name
  updatedAt: string;
}

export interface ShoppingListMember {
  id: string;
  listId: string;
  email: string;
  displayName: string;
  role: "owner" | "member";
  joinedAt: string;
}

export interface ShoppingList {
  id: string;
  ownerId: string;
  name: string;
  notes?: string;
  budget?: number;
  storeId?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  items: ShoppingListItem[];
  members: ShoppingListMember[];
}

export interface ShoppingTrip {
  id: string;
  listId: string;
  storeId: string;
  startedAt: string;
  completedAt?: string;
}

export interface PurchaseHistory {
  id: string;
  userId: string;
  listId: string;
  storeId: string;
  purchasedAt: string;
  total: number;
  itemCount: number;
}

export interface SavedProduct {
  id: string;
  userId: string;
  product: Product;
  savedAt: string;
}

export interface RetailerCapabilities {
  searchStores: boolean;
  searchProducts: boolean;
  barcodeLookup: boolean;
  liveAvailability: boolean;
  verifiedLocations: boolean;
  live: boolean; // false => demo/mock data
}

// ---- Provider I/O ----

export interface StoreSearchInput {
  query?: string;
  zip?: string;
  limit?: number;
}

export interface ProductSearchInput {
  query: string;
  storeId?: string;
  limit?: number;
}
