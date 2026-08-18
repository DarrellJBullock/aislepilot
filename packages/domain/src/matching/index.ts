import type { Product } from "../types";

/** Normalize a search term or product string for comparison. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOPWORDS = new Set(["the", "a", "an", "of", "and", "with", "for"]);

export function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

/**
 * Score a product against a raw list entry. Higher is better.
 * Combines name/brand/category token overlap with a light exact-substring bonus.
 */
export function scoreProduct(query: string, product: Product): number {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return 0;

  const haystack = normalize(
    [product.name, product.brand, product.category, product.department]
      .filter(Boolean)
      .join(" "),
  );
  const hayTokens = new Set(haystack.split(" "));

  let overlap = 0;
  for (const t of qTokens) {
    if (hayTokens.has(t)) overlap += 1;
    else if (haystack.includes(t)) overlap += 0.5;
  }

  let score = overlap / qTokens.length; // 0..1

  // Whole-phrase bonus.
  if (haystack.includes(normalize(query))) score += 0.5;

  // Prefer in-stock products slightly.
  if (product.availability === "in_stock") score += 0.05;
  else if (product.availability === "out_of_stock") score -= 0.1;

  return score;
}

export interface MatchOptions {
  storeId?: string;
  limit?: number;
  minScore?: number;
}

/** Rank candidate products for a raw list entry. */
export function matchProducts(
  query: string,
  catalog: Product[],
  options: MatchOptions = {},
): Product[] {
  const { storeId, limit = 8, minScore = 0.34 } = options;
  const scoped = storeId
    ? catalog.filter((p) => !p.storeId || p.storeId === storeId)
    : catalog;

  return scoped
    .map((product) => ({ product, score: scoreProduct(query, product) }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.product);
}

export interface ScorableItem {
  id: string;
  rawText: string;
}

/**
 * The best-scoring candidate for a product (e.g. a barcode scan result),
 * or null if nothing clears minScore. Used where an auto-match needs a
 * single confident answer rather than matchProducts()'s ranked list —
 * e.g. deciding whether a scanned product is "the milk on your list" or
 * an off-list item that should just get added.
 */
export function findBestMatchingItem<T extends ScorableItem>(
  items: T[],
  product: Product,
  minScore = 0.5,
): (T & { score: number }) | null {
  let best: (T & { score: number }) | null = null;
  for (const item of items) {
    const score = scoreProduct(item.rawText, product);
    if (score >= minScore && (!best || score > best.score)) {
      best = { ...item, score };
    }
  }
  return best;
}
