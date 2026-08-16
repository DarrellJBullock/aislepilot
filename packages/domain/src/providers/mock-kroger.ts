import type { RetailerProvider } from "../provider";
import type {
  Product,
  ProductAvailability,
  ProductSearchInput,
  RetailerCapabilities,
  Store,
  StoreSearchInput,
} from "../types";
import { matchProducts } from "../matching";
import {
  MOCK_STORES,
  allMockProducts,
  catalogForStore,
  findStore,
} from "../mock/stores";

/** Fully offline provider backed by demo data. Requires no credentials. */
export class MockKrogerProvider implements RetailerProvider {
  async searchStores(input: StoreSearchInput): Promise<Store[]> {
    const q = input.query?.toLowerCase().trim();
    const zip = input.zip?.trim();
    let stores = MOCK_STORES;
    if (zip) {
      // Demo behaviour: exact-zip first, otherwise return all demo stores.
      const exact = stores.filter((s) => s.zip === zip);
      if (exact.length) stores = exact;
    }
    if (q) {
      stores = stores.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.banner.toLowerCase().includes(q),
      );
    }
    return stores.slice(0, input.limit ?? 20);
  }

  async getStore(storeId: string): Promise<Store> {
    const store = findStore(storeId);
    if (!store) throw new Error(`Store not found: ${storeId}`);
    return store;
  }

  async searchProducts(input: ProductSearchInput): Promise<Product[]> {
    const catalog = input.storeId
      ? catalogForStore(input.storeId)
      : allMockProducts();
    return matchProducts(input.query, catalog, {
      storeId: input.storeId,
      limit: input.limit ?? 8,
    });
  }

  async getProduct(productId: string, storeId?: string): Promise<Product> {
    const catalog = storeId ? catalogForStore(storeId) : allMockProducts();
    const product =
      catalog.find((p) => p.id === productId) ??
      catalog.find((p) => p.externalId === productId);
    if (!product) throw new Error(`Product not found: ${productId}`);
    return product;
  }

  async getAvailability(
    productId: string,
    storeId: string,
  ): Promise<ProductAvailability> {
    const product = await this.getProduct(productId, storeId);
    return {
      productId,
      storeId,
      availability: product.availability,
      sourceUpdatedAt: product.sourceUpdatedAt,
    };
  }

  async lookupBarcode(upc: string, storeId?: string): Promise<Product | null> {
    const clean = upc.replace(/\D/g, "");
    const catalog = storeId ? catalogForStore(storeId) : allMockProducts();
    return (
      catalog.find((p) => (p.upc ?? "").replace(/\D/g, "") === clean) ?? null
    );
  }

  getCapabilities(): RetailerCapabilities {
    return {
      searchStores: true,
      searchProducts: true,
      barcodeLookup: true,
      liveAvailability: false,
      verifiedLocations: false,
      live: false,
    };
  }
}
