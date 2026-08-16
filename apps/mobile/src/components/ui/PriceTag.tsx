import { View, Text } from "react-native";
import type { Product } from "@aislepilot/domain/types";
import { effectiveUnitPrice, formatCurrency, isOnSale } from "@aislepilot/domain/pricing";
import { cn } from "../../lib/cn";

export function PriceTag({
  product,
  className,
  size = "md",
}: {
  product?: Product;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  if (!product) return <Text className="text-ink-muted">—</Text>;
  const price = effectiveUnitPrice(product);
  const sale = isOnSale(product);
  const sizeClass = { sm: "text-sm", md: "text-[15px]", lg: "text-xl" }[size];

  return (
    <View className={cn("flex-row items-baseline gap-1.5", className)}>
      <Text className={cn("font-semibold", sale ? "text-brand-700" : "text-ink", sizeClass)}>
        {formatCurrency(price)}
      </Text>
      {sale && product.regularPrice != null && (
        <Text className="text-xs text-ink-muted line-through">
          {formatCurrency(product.regularPrice)}
        </Text>
      )}
    </View>
  );
}
