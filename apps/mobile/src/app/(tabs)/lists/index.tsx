import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Plus, ChevronRight, Archive } from "lucide-react-native";
import { computeProgress } from "@aislepilot/domain/progress";
import { computeTotals } from "@aislepilot/domain/pricing";
import { useApp } from "../../../store/context";
import { Card, CardBody, Button, EmptyState, Progress } from "../../../components/ui";

export default function ListsIndex() {
  const router = useRouter();
  const { lists } = useApp();
  const active = lists.filter((l) => !l.archived);
  const archived = lists.filter((l) => l.archived);

  return (
    <FlatList
      className="flex-1 bg-[#f7f8fa]"
      contentContainerClassName="px-4 pb-8 pt-4"
      data={active}
      keyExtractor={(l) => l.id}
      ListHeaderComponent={
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-ink">Lists</Text>
          <Button size="sm" onPress={() => router.push("/(tabs)/lists/new")}>
            <View className="flex-row items-center gap-1">
              <Plus size={16} color="#fff" />
              <Text className="text-sm font-semibold text-white">New</Text>
            </View>
          </Button>
        </View>
      }
      ItemSeparatorComponent={() => <View className="h-2" />}
      renderItem={({ item }) => {
        const progress = computeProgress(item);
        const totals = computeTotals(item);
        return (
          <Pressable onPress={() => router.push(`/(tabs)/lists/${item.id}`)}>
            <Card>
              <CardBody>
                <View className="flex-row items-center justify-between">
                  <Text className="flex-shrink text-base font-semibold text-ink">{item.name}</Text>
                  <ChevronRight size={18} color="#6b7688" />
                </View>
                <Text className="mt-0.5 text-sm text-ink-muted">
                  {item.items.length} item{item.items.length === 1 ? "" : "s"} · $
                  {totals.estimatedTotal.toFixed(2)} estimated
                </Text>
                {progress.total > 0 && (
                  <View className="mt-2.5">
                    <Progress value={progress.percent} />
                  </View>
                )}
              </CardBody>
            </Card>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState
          icon={<Archive size={28} color="#18b365" />}
          title="No lists yet"
          description="Create your first shopping list to get priced, aisle-by-aisle shopping."
          action={
            <Button onPress={() => router.push("/(tabs)/lists/new")}>
              <Text className="font-semibold text-white">Create a list</Text>
            </Button>
          }
        />
      }
      ListFooterComponent={
        archived.length > 0 ? (
          <View className="mt-6">
            <Text className="mb-2 text-sm font-semibold text-ink-muted">
              Archived ({archived.length})
            </Text>
            {archived.map((l) => (
              <Pressable key={l.id} onPress={() => router.push(`/(tabs)/lists/${l.id}`)}>
                <Card className="mb-2 opacity-70">
                  <CardBody>
                    <Text className="font-medium text-ink">{l.name}</Text>
                  </CardBody>
                </Card>
              </Pressable>
            ))}
          </View>
        ) : null
      }
    />
  );
}
