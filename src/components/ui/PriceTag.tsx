import type { Product } from "@/domain/types";
import { effectiveUnitPrice, formatCurrency, isOnSale } from "@/domain/pricing";
import { cn } from "@/lib/utils";

export function PriceTag({
  product,
  className,
  size = "md",
}: {
  product?: Product;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  if (!product) return <span className="text-ink-muted">—</span>;
  const price = effectiveUnitPrice(product);
  const sale = isOnSale(product);
  const sizes = {
    sm: "text-sm",
    md: "text-[15px]",
    lg: "text-xl",
  }[size];

  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <span className={cn("font-semibold tabular-nums", sale ? "text-brand-700" : "text-ink", sizes)}>
        {formatCurrency(price)}
      </span>
      {sale && product.regularPrice != null && (
        <span className="text-xs text-ink-muted line-through tabular-nums">
          {formatCurrency(product.regularPrice)}
        </span>
      )}
    </span>
  );
}
