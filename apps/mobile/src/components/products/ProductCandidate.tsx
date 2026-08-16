import { View, Text } from "react-native";
import { Check, MapPin } from "lucide-react-native";
import type { Product } from "@aislepilot/domain/types";
import { ProductImage, PriceTag, AvailabilityPill, LocationBadge, Button } from "../ui";
import { cn } from "../../lib/cn";

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
    <View
      className={cn(
        "flex-row gap-3 rounded-2xl border p-3",
        selected ? "border-brand-500 bg-brand-50" : "border-black/10 bg-white",
      )}
    >
      <ProductImage name={product.name} imageUrl={product.imageUrl} size={56} />
      <View className="min-w-0 flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className="font-semibold text-ink">
              {product.name}
            </Text>
            <Text numberOfLines={1} className="text-sm text-ink-muted">
              {product.brand} · {product.size}
            </Text>
          </View>
          <PriceTag product={product} />
        </View>
        <View className="mt-2 flex-row flex-wrap items-center gap-1.5">
          <AvailabilityPill availability={product.availability} />
          <LocationBadge source={product.locationSource} />
          {(product.department || product.aisle) && (
            <View className="flex-row items-center gap-1">
              <MapPin size={11} color="#6b7688" />
              <Text className="text-xs text-ink-muted">
                {product.department}
                {product.aisle ? ` · Aisle ${product.aisle}` : ""}
              </Text>
            </View>
          )}
        </View>
        <View className="mt-2.5">
          <Button size="sm" variant={selected ? "secondary" : "primary"} onPress={onSelect}>
            <View className="flex-row items-center gap-1.5">
              {selected && <Check size={14} color="#0d5b39" />}
              <Text className={cn("text-sm font-semibold", selected ? "text-brand-800" : "text-white")}>
                {selected ? "Selected" : "Select"}
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </View>
  );
}
