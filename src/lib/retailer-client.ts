"use client";

import type { Product, Store } from "@/domain/types";

/** Browser helpers that call server retailer API routes (credentials stay server-side). */

export async function fetchStores(params: { q?: string; zip?: string } = {}): Promise<{
  stores: Store[];
  live: boolean;
}> {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.zip) qs.set("zip", params.zip);
  const res = await fetch(`/api/retailers/stores?${qs.toString()}`);
  if (!res.ok) return { stores: [], live: false };
  return res.json();
}

export async function fetchProducts(
  query: string,
  storeId?: string,
): Promise<{ products: Product[]; live: boolean }> {
  const qs = new URLSearchParams({ q: query });
  if (storeId) qs.set("storeId", storeId);
  const res = await fetch(`/api/retailers/products?${qs.toString()}`);
  if (!res.ok) return { products: [], live: false };
  return res.json();
}
