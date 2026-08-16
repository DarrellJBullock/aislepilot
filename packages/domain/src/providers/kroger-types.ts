// Minimal typings for the subset of the Kroger Public API we consume.
// Full schema: https://developer.kroger.com/reference/

export interface KrogerTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface KrogerAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  county?: string;
}

export interface KrogerLocationDepartment {
  departmentId?: string;
  name?: string;
}

export interface KrogerLocation {
  locationId: string;
  chain?: string;
  name?: string;
  address?: KrogerAddress;
  departments?: KrogerLocationDepartment[];
}

export interface KrogerAisleLocation {
  bayNumber?: string;
  description?: string;
  number?: string;
  numberOfFacings?: string;
  sequenceNumber?: string;
  side?: string;
  shelfNumber?: string;
  shelfPositionInBay?: string;
}

export interface KrogerItemPrice {
  regular?: number;
  promo?: number;
  regularPerUnitEstimate?: number;
  promoPerUnitEstimate?: number;
}

export interface KrogerItemInventory {
  stockLevel?: "HIGH" | "LOW" | "TEMPORARILY_OUT_OF_STOCK" | string;
}

export interface KrogerItem {
  itemId?: string;
  size?: string;
  price?: KrogerItemPrice;
  inventory?: KrogerItemInventory;
  fulfillment?: Record<string, boolean>;
}

export interface KrogerImageSize {
  size?: "thumbnail" | "small" | "medium" | "large" | "xlarge" | string;
  url?: string;
}

export interface KrogerImage {
  perspective?: string;
  featured?: boolean;
  sizes?: KrogerImageSize[];
}

export interface KrogerProduct {
  productId: string;
  upc?: string;
  brand?: string;
  categories?: string[];
  description?: string;
  items?: KrogerItem[];
  aisleLocations?: KrogerAisleLocation[];
  images?: KrogerImage[];
}

export interface KrogerListResponse<T> {
  data: T[];
  meta?: unknown;
}

export interface KrogerItemResponse<T> {
  data: T;
  meta?: unknown;
}
