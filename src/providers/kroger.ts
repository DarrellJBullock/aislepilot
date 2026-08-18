import type { RetailerProvider } from "@aislepilot/domain/provider";
import type {
  Product,
  ProductAvailability,
  ProductSearchInput,
  RetailerCapabilities,
  Store,
  StoreSearchInput,
} from "@aislepilot/domain/types";
import type {
  KrogerItemResponse,
  KrogerListResponse,
  KrogerLocation,
  KrogerProduct,
  KrogerTokenResponse,
} from "@aislepilot/domain/providers/kroger-types";
import { resolveCityToZip } from "@/lib/geocode";
import { mapProduct, mapStore } from "@aislepilot/domain/providers/kroger-map";

export interface KrogerConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

const TOKEN_PATH = "/connect/oauth2/token";
const SCOPE = "product.compact";
const EXPIRY_BUFFER_MS = 60_000; // refresh a minute early

/**
 * Live Kroger Public API provider. Uses the OAuth2 client-credentials flow with
 * an in-memory token cache. Credentials are server-only — this class is only
 * ever instantiated by the server-side provider factory and never bundled to the
 * client. Aisle data returned for the requested store is marked
 * `retailer_verified`; everything else falls back to a category estimate.
 */
export class KrogerProvider implements RetailerProvider {
  private token: string | null = null;
  private tokenExpiresAt = 0;

  constructor(private readonly config: KrogerConfig) {}

  // ---- OAuth ----

  private async getToken(force = false): Promise<string> {
    const now = Date.now();
    if (!force && this.token && now < this.tokenExpiresAt - EXPIRY_BUFFER_MS) {
      return this.token;
    }
    const basic = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
    ).toString("base64");

    const res = await fetch(`${this.config.baseUrl}${TOKEN_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({ grant_type: "client_credentials", scope: SCOPE }),
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Kroger auth failed: ${res.status} ${await safeText(res)}`);
    }
    const data = (await res.json()) as KrogerTokenResponse;
    this.token = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
    return this.token;
  }

  private async authedGet<T>(
    path: string,
    params: Record<string, string | number | undefined>,
  ): Promise<T> {
    const url = new URL(`${this.config.baseUrl}${path}`);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }

    const doFetch = async (token: string) =>
      fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
      });

    let res = await doFetch(await this.getToken());
    if (res.status === 401) {
      // Token may have been revoked/expired early — refresh once and retry.
      res = await doFetch(await this.getToken(true));
    }
    if (!res.ok) {
      throw new Error(`Kroger API ${path} failed: ${res.status} ${await safeText(res)}`);
    }
    return (await res.json()) as T;
  }

  // ---- Stores ----

  async searchStores(input: StoreSearchInput): Promise<Store[]> {
    // Live location search is geo-based (filter.zipCode.near) — Kroger has
    // no free-text city search endpoint. Accept an explicit zip, a 5-digit
    // token embedded in the free-text query, or resolve a city name (e.g.
    // "Cincinnati" or "Cincinnati, OH") to a zip via the bundled US
    // city/zip lookup.
    const zip =
      input.zip ??
      input.query?.match(/\b\d{5}\b/)?.[0] ??
      (input.query ? resolveCityToZip(input.query) : undefined);
    if (!zip) return [];
    const res = await this.authedGet<KrogerListResponse<KrogerLocation>>("/locations", {
      "filter.zipCode.near": zip,
      "filter.limit": input.limit ?? 15,
    });
    return res.data.map(mapStore);
  }

  async getStore(storeId: string): Promise<Store> {
    const res = await this.authedGet<KrogerItemResponse<KrogerLocation>>(
      `/locations/${encodeURIComponent(storeId)}`,
      {},
    );
    return mapStore(res.data);
  }

  // ---- Products ----

  async searchProducts(input: ProductSearchInput): Promise<Product[]> {
    const res = await this.authedGet<KrogerListResponse<KrogerProduct>>("/products", {
      "filter.term": input.query,
      "filter.locationId": input.storeId,
      "filter.limit": input.limit ?? 12,
    });
    return res.data.map((p) => mapProduct(p, input.storeId));
  }

  async getProduct(productId: string, storeId?: string): Promise<Product> {
    // productId may be prefixed with our "storeId:" — strip it for the API call.
    const externalId = productId.includes(":") ? productId.split(":").pop()! : productId;
    const res = await this.authedGet<KrogerItemResponse<KrogerProduct>>(
      `/products/${encodeURIComponent(externalId)}`,
      { "filter.locationId": storeId },
    );
    return mapProduct(res.data, storeId);
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
      sourceUpdatedAt: new Date().toISOString(),
    };
  }

  async lookupBarcode(upc: string, storeId?: string): Promise<Product | null> {
    const clean = upc.replace(/\D/g, "");
    if (!clean) return null;
    const res = await this.authedGet<KrogerListResponse<KrogerProduct>>("/products", {
      "filter.term": clean,
      "filter.locationId": storeId,
      "filter.limit": 5,
    });
    const exact =
      res.data.find((p) => (p.upc ?? "").replace(/\D/g, "") === clean) ?? res.data[0];
    return exact ? mapProduct(exact, storeId) : null;
  }

  getCapabilities(): RetailerCapabilities {
    return {
      searchStores: true,
      searchProducts: true,
      barcodeLookup: true,
      liveAvailability: true,
      // Kroger returns verified aisle data for the requested store when available.
      verifiedLocations: true,
      live: true,
    };
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 200);
  } catch {
    return "";
  }
}
