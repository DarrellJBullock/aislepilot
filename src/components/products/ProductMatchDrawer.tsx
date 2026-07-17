"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { Product } from "@/domain/types";
import { fetchProducts } from "@/lib/retailer-client";
import {
  Modal,
  Input,
  Skeleton,
  EmptyState,
  DemoBadge,
} from "@/components/ui";
import { ProductCandidate } from "./ProductCandidate";

export function ProductMatchDrawer({
  open,
  onClose,
  initialQuery,
  storeId,
  currentProductId,
  onSelect,
  title = "Match a product",
}: {
  open: boolean;
  onClose: () => void;
  initialQuery: string;
  storeId?: string;
  currentProductId?: string;
  onSelect: (product: Product) => void;
  title?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (open) setQuery(initialQuery);
  }, [open, initialQuery]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await fetchProducts(query, storeId);
      if (!active) return;
      setProducts(res.products);
      setLive(res.live);
      setLoading(false);
    }, 220);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [open, query, storeId]);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <Input
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products"
          aria-label="Search products"
          autoFocus
        />
      </div>

      {!live && (
        <div className="mb-3 flex items-center gap-2 text-xs text-ink-muted">
          <DemoBadge /> Prices &amp; availability are demo data.
        </div>
      )}

      <div className="space-y-2">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[92px] w-full rounded-2xl" />
          ))}

        {!loading && products.length === 0 && (
          <EmptyState
            title="No matching products"
            description="Try a simpler term, like “milk” or “bread”."
          />
        )}

        {!loading &&
          products.map((p) => (
            <ProductCandidate
              key={p.id}
              product={p}
              selected={p.id === currentProductId}
              onSelect={() => {
                onSelect(p);
                onClose();
              }}
            />
          ))}
      </div>
    </Modal>
  );
}
