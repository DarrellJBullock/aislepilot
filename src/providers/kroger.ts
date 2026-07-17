import type { RetailerProvider } from "@/domain/provider";
import type {
  Product,
  ProductAvailability,
  ProductSearchInput,
  RetailerCapabilities,
  Store,
  StoreSearchInput,
} from "@/domain/types";

export interface KrogerConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

/**
 * Live Kroger provider shell. Credentials are server-only and must never reach
 * the browser. Endpoints are stubbed; wiring real HTTP calls + OAuth token
 * caching is the documented "live integration" step. Until implemented it
 * throws, so the factory falls back to the mock provider.
 */
export class KrogerProvider implements RetailerProvider {
  constructor(private readonly config: KrogerConfig) {}

  private notImplemented(): never {
    throw new Error(
      "KrogerProvider live calls are not implemented in the MVP. " +
        "See README 'Live Kroger integration steps'. Using mock data instead.",
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async searchStores(_input: StoreSearchInput): Promise<Store[]> {
    this.notImplemented();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getStore(_storeId: string): Promise<Store> {
    this.notImplemented();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async searchProducts(_input: ProductSearchInput): Promise<Product[]> {
    this.notImplemented();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getProduct(_productId: string, _storeId?: string): Promise<Product> {
    this.notImplemented();
  }
  async getAvailability(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _productId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _storeId: string,
  ): Promise<ProductAvailability> {
    this.notImplemented();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async lookupBarcode(_upc: string, _storeId?: string): Promise<Product | null> {
    this.notImplemented();
  }

  getCapabilities(): RetailerCapabilities {
    return {
      searchStores: true,
      searchProducts: true,
      barcodeLookup: true,
      liveAvailability: true,
      verifiedLocations: false,
      live: true,
    };
  }
}
