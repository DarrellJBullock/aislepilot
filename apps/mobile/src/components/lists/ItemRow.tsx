import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { MapPin, Minus, Plus, Trash2, Repeat, Tag, ChevronDown, Flag } from "lucide-react-native";
import type { ShoppingListItem } from "@aislepilot/domain/types";
import { itemSubtotal, formatCurrency } from "@aislepilot/domain/pricing";
import { useApp } from "../../store/context";
import { ProductImage, PriceTag, StatusPill, AvailabilityPill, LocationBadge, Button, Badge, Input } from "../ui";
import { ProductMatchSheet } from "../products/ProductMatchSheet";

const PRIORITY_TONE = { low: "neutral", normal: "blue", high: "amber" } as const;

export function ItemRow({ item, storeId }: { item: ShoppingListItem; storeId?: string }) {
  const { updateItem, removeItem, matchItem, setItemPriority } = useApp();
  const [sheet, setSheet] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const p = item.product;

  return (
    <View className="rounded-2xl border border-black/5 bg-white p-3">
      <View className="flex-row gap-3">
        {p ? (
          <ProductImage name={p.name} imageUrl={p.imageUrl} size={52} />
        ) : (
          <View className="h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-black/5">
            <Tag size={20} color="#6b7688" />
          </View>
        )}

        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="font-semibold text-ink">
                {p ? p.name : item.rawText}
              </Text>
              {p ? (
                <Text numberOfLines={1} className="text-sm text-ink-muted">
                  &ldquo;{item.rawText}&rdquo; · {p.brand} · {p.size}
                </Text>
              ) : (
                <Text className="text-sm text-ink-muted">Not matched yet</Text>
              )}
            </View>
            {p && (
              <View className="items-end">
                <PriceTag product={p} size="sm" />
                <Text className="text-xs text-ink-muted">= {formatCurrency(itemSubtotal(item))}</Text>
              </View>
            )}
          </View>

          <View className="mt-2 flex-row flex-wrap items-center gap-1.5">
            <StatusPill status={item.status} />
            {p && <AvailabilityPill availability={p.availability} />}
            {p && <LocationBadge source={p.locationSource} />}
            {item.priority !== "normal" && (
              <Badge tone={PRIORITY_TONE[item.priority]}>
                <View className="flex-row items-center gap-1">
                  <Flag size={11} color="#111826" />
                  <Text className="text-xs font-medium capitalize">{item.priority}</Text>
                </View>
              </Badge>
            )}
            {p?.aisle && (
              <View className="flex-row items-center gap-1">
                <MapPin size={11} color="#6b7688" />
                <Text className="text-xs text-ink-muted">Aisle {p.aisle}</Text>
              </View>
            )}
          </View>

          <View className="mt-3 flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-1 rounded-full border border-black/10 p-0.5">
              <Pressable
                onPress={() => updateItem(item.listId, item.id, { quantity: item.quantity - 1 })}
                disabled={item.quantity <= 1}
                style={{ opacity: item.quantity <= 1 ? 0.3 : 1 }}
                className="h-7 w-7 items-center justify-center rounded-full"
                accessibilityLabel="Decrease quantity"
              >
                <Minus size={14} color="#111826" />
              </Pressable>
              <Text className="w-6 text-center text-sm font-semibold">{item.quantity}</Text>
              <Pressable
                onPress={() => updateItem(item.listId, item.id, { quantity: item.quantity + 1 })}
                className="h-7 w-7 items-center justify-center rounded-full"
                accessibilityLabel="Increase quantity"
              >
                <Plus size={14} color="#111826" />
              </Pressable>
            </View>

            <View className="flex-row items-center gap-1.5">
              <Button size="sm" variant={p ? "outline" : "primary"} onPress={() => setSheet(true)}>
                <View className="flex-row items-center gap-1.5">
                  {p && <Repeat size={14} color="#111826" />}
                  <Text className={`text-sm font-semibold ${p ? "text-ink" : "text-white"}`}>
                    {p ? "Change" : "Match product"}
                  </Text>
                </View>
              </Button>
              <Pressable
                onPress={() => setExpanded((e) => !e)}
                className="h-8 w-8 items-center justify-center rounded-full"
                accessibilityLabel="More options"
                accessibilityState={{ expanded }}
              >
                <ChevronDown size={16} color="#6b7688" style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }} />
              </Pressable>
            </View>
          </View>

          {expanded && (
            <View className="mt-3 gap-3 border-t border-black/5 pt-3">
              <View>
                <Text className="mb-1 text-xs font-medium text-ink-soft">Notes</Text>
                <Input
                  defaultValue={item.notes}
                  placeholder="e.g. organic if available"
                  onEndEditing={(e) => updateItem(item.listId, item.id, { notes: e.nativeEvent.text })}
                  className="h-9 text-sm"
                />
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1">
                  <Text className="mr-1 text-xs font-medium text-ink-soft">Priority</Text>
                  {(["low", "normal", "high"] as const).map((pr) => (
                    <Pressable
                      key={pr}
                      onPress={() => setItemPriority(item.listId, item.id, pr)}
                      className={`rounded-full px-2.5 py-1 ${item.priority === pr ? "bg-brand-600" : "bg-black/5"}`}
                    >
                      <Text
                        className={`text-xs font-medium capitalize ${item.priority === pr ? "text-white" : "text-ink-soft"}`}
                      >
                        {pr}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable
                  onPress={() => removeItem(item.listId, item.id)}
                  className="flex-row items-center gap-1 rounded-lg px-2 py-1.5"
                >
                  <Trash2 size={14} color="#dc2626" />
                  <Text className="text-sm text-red-600">Remove</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>

      <ProductMatchSheet
        open={sheet}
        onClose={() => setSheet(false)}
        initialQuery={item.rawText}
        storeId={storeId}
        currentProductId={p?.id}
        onSelect={(product) => matchItem(item.listId, item.id, product)}
      />
    </View>
  );
}
