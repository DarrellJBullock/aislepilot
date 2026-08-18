import { View, Text } from "react-native";
// See src/app/shopping/[listId].tsx for why FlatList comes from
// react-native-gesture-handler, not react-native, in this app.
import { FlatList } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bookmark } from "lucide-react-native";
import { useApp } from "../../store/context";
import { Card, CardBody, ProductImage, PriceTag, EmptyState } from "../../components/ui";

export default function Saved() {
  const insets = useSafeAreaInsets();
  const { savedProducts } = useApp();

  return (
    <FlatList
      className="flex-1 bg-[#f7f8fa]"
      contentContainerClassName="px-4 pb-8"
      contentContainerStyle={{ paddingTop: insets.top + 16 }}
      data={savedProducts}
      keyExtractor={(s) => s.id}
      ListHeaderComponent={<Text className="mb-3 text-2xl font-bold text-ink">Saved</Text>}
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
