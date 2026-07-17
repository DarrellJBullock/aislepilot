"use client";

import { Check, MapPin } from "lucide-react";
import type { Product } from "@/domain/types";
import {
  ProductImage,
  PriceTag,
  AvailabilityPill,
  LocationBadge,
  Button,
} from "@/components/ui";
import { cn } from "@/lib/utils";

export function ProductCandidate({
  product,
  selected,
  onSelect,
}: {
  product: Product;
  selected?: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border p-3",
        selected ? "border-brand-500 bg-brand-50" : "border-black/10 bg-white",
      )}
    >
      <ProductImage name={product.name} imageUrl={product.imageUrl} size={56} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{product.name}</p>
            <p className="truncate text-sm text-ink-muted">
              {product.brand} · {product.size}
            </p>
          </div>
          <PriceTag product={product} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <AvailabilityPill availability={product.availability} />
          <LocationBadge source={product.locationSource} />
          {(product.department || product.aisle) && (
            <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
              <MapPin size={11} />
              {product.department}
              {product.aisle ? ` · Aisle ${product.aisle}` : ""}
            </span>
          )}
        </div>
        <div className="mt-2.5">
          <Button size="sm" variant={selected ? "secondary" : "primary"} onClick={onSelect}>
            {selected ? (
              <>
                <Check size={14} /> Selected
              </>
            ) : (
              "Select"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
