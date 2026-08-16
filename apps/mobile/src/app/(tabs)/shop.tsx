import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StorePicker } from "../../components/stores/StorePicker";
import { usePreferredStore } from "../../lib/use-preferred-store";
import { Card, CardBody, Badge } from "../../components/ui";

export default function Shop() {
  const insets = useSafeAreaInsets();
  const { store, setPreferredStore } = usePreferredStore();

  return (
    <ScrollView
      className="flex-1 bg-[#f7f8fa]"
      contentContainerClassName="px-4 pb-8"
      contentContainerStyle={{ paddingTop: insets.top + 16 }}
    >
      <Text className="text-2xl font-bold text-ink">Shop</Text>
      <Text className="mt-1 text-sm text-ink-muted">
        Choose your store to load its prices, availability, and aisle layout.
      </Text>

      {store && (
        <Card className="mt-4">
          <CardBody className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-medium uppercase text-ink-muted">Current store</Text>
              <Text className="mt-0.5 font-semibold text-ink">{store.name}</Text>
              <Text className="text-sm text-ink-muted">
                {store.city}, {store.state}
              </Text>
            </View>
            {store.demo && <Badge tone="amber">Demo</Badge>}
          </CardBody>
        </Card>
      )}

      <View className="mt-5">
        <StorePicker value={store?.id} onChange={(id, s) => setPreferredStore(id, s)} />
      </View>
    </ScrollView>
  );
}
