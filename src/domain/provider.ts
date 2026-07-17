// Retailer provider contract. Implementations: MockKrogerProvider (default),
// KrogerProvider (live shell). Credentials must stay server-only.

import type {
  Product,
  ProductAvailability,
  ProductSearchInput,
  RetailerCapabilities,
  Store,
  StoreSearchInput,
} from "./types";

export interface RetailerProvider {
  searchStores(input: StoreSearchInput): Promise<Store[]>;
  getStore(storeId: string): Promise<Store>;
  searchProducts(input: ProductSearchInput): Promise<Product[]>;
  getProduct(productId: string, storeId?: string): Promise<Product>;
  getAvailability(productId: string, storeId: string): Promise<ProductAvailability>;
  lookupBarcode(upc: string, storeId?: string): Promise<Product | null>;
  getCapabilities(): RetailerCapabilities;
}
