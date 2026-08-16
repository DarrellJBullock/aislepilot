// Mobile retailer access. Mirrors src/lib/retailer-client.ts's contract
// against the *already deployed* /api/retailers/* Next.js routes (the "React
// Native -> AislePilot API -> Kroger" path from the architecture spec — no
// separate backend needed, and Kroger credentials never enter this bundle).
// When the API is unreachable (no EXPO_PUBLIC_API_BASE_URL, offline, network
// error), falls back to the same MockKrogerProvider the web app uses in mock
// mode, imported directly from the shared domain package — so the app is
// fully usable with zero credentials and zero network, per spec.
import type { Product, Store, StoreSearchInput } from "@aislepilot/domain/types";
import { MockKrogerProvider } from "@aislepilot/domain/providers/mock-kroger";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const FETCH_TIMEOUT_MS = 6000;
const mock = new MockKrogerProvider();

async function timedFetch(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function searchStores(
  input: StoreSearchInput,
): Promise<{ stores: Store[]; live: boolean; offline: boolean }> {
  if (API_BASE_URL) {
    try {
      const qs = new URLSearchParams();
      if (input.query) qs.set("q", input.query);
      if (input.zip) qs.set("zip", input.zip);
      const res = await timedFetch(`${API_BASE_URL}/api/retailers/stores?${qs.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as { stores: Store[]; live: boolean };
        return { ...data, offline: false };
      }
    } catch {
      // fall through to local mock
    }
  }
  const stores = await mock.searchStores(input);
  return { stores, live: false, offline: true };
}

export async function getStore(storeId: string): Promise<Store | null> {
  try {
    return await mock.getStore(storeId);
  } catch {
    return null;
  }
}

export async function searchProducts(
  query: string,
  storeId?: string,
): Promise<{ products: Product[]; live: boolean; offline: boolean }> {
  if (!query.trim()) return { products: [], live: false, offline: false };
  if (API_BASE_URL) {
    try {
      const qs = new URLSearchParams({ q: query });
      if (storeId) qs.set("storeId", storeId);
      const res = await timedFetch(`${API_BASE_URL}/api/retailers/products?${qs.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as { products: Product[]; live: boolean };
        return { ...data, offline: false };
      }
    } catch {
      // fall through to local mock
    }
  }
  const products = await mock.searchProducts({ query, storeId });
  return { products, live: false, offline: true };
}

export async function lookupBarcode(
  upc: string,
  storeId?: string,
): Promise<{ product: Product | null; live: boolean; offline: boolean }> {
  if (API_BASE_URL) {
    try {
      const qs = new URLSearchParams({ upc });
      if (storeId) qs.set("storeId", storeId);
      const res = await timedFetch(`${API_BASE_URL}/api/retailers/barcode?${qs.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as { product: Product | null; live: boolean };
        return { ...data, offline: false };
      }
    } catch {
      // fall through to local mock
    }
  }
  const product = await mock.lookupBarcode(upc, storeId);
  return { product, live: false, offline: true };
}
