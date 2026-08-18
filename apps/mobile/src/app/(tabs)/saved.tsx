import { View, Text } from "react-native";
// See src/app/shopping/[listId].tsx for why FlatList comes from
// react-native-gesture-handler, not react-native, in this app.
import { FlatList } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bookmark, Receipt } from "lucide-react-native";
import { formatCurrency } from "@aislepilot/domain/pricing";
import { useApp } from "../../store/context";
import { Card, CardBody, ProductImage, PriceTag, EmptyState } from "../../components/ui";

export default function Saved() {
  const insets = useSafeAreaInsets();
  const { savedProducts, purchaseHistory } = useApp();

  return (
    <FlatList
      className="flex-1 bg-[#f7f8fa]"
      contentContainerClassName="px-4 pb-8"
      contentContainerStyle={{ paddingTop: insets.top + 16 }}
      data={savedProducts}
      keyExtractor={(s) => s.id}
      ListHeaderComponent={
        <View className="mb-3">
          <Text className="mb-3 text-2xl font-bold text-ink">Saved</Text>

          <Card>
            <CardBody>
              <View className="flex-row items-center gap-2">
                <Receipt size={18} color="#0c9152" />
                <Text className="font-semibold text-ink">Purchase history</Text>
              </View>
              {purchaseHistory.length === 0 ? (
                <Text className="mt-2 text-sm text-ink-muted">
                  Completed shopping trips will appear here.
                </Text>
              ) : (
                <View className="mt-3 gap-2">
                  {purchaseHistory.map((h) => (
                    <View
                      key={h.id}
                      className="flex-row items-center justify-between rounded-xl border border-black/5 p-3"
                    >
                      <Text className="text-sm text-ink-soft">
                        {new Date(h.purchasedAt).toLocaleDateString()} · {h.itemCount} item
                        {h.itemCount === 1 ? "" : "s"}
                      </Text>
                      <Text className="font-semibold text-ink">{formatCurrency(h.total)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </CardBody>
          </Card>

          <Text className="mb-1 mt-5 text-sm font-semibold uppercase text-ink-muted">Saved products</Text>
        </View>
      }
      ItemSeparatorComponent={() => <View className="h-2" />}
      renderItem={({ item }) => (
        <Card>
          <CardBody className="flex-row items-center gap-3">
            <ProductImage name={item.product.name} imageUrl={item.product.imageUrl} size={48} />
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="font-semibold text-ink">
                {item.product.name}
              </Text>
              <Text className="text-sm text-ink-muted">
                {item.product.brand} · {item.product.size}
              </Text>
            </View>
            <PriceTag product={item.product} size="sm" />
          </CardBody>
        </Card>
      )}
      ListEmptyComponent={
        <EmptyState
          icon={<Bookmark size={28} color="#18b365" />}
          title="No saved products yet"
          description="Products you save from a match will show up here for quick re-adding to a list."
        />
      }
    />
  );
}
