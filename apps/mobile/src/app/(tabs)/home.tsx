import { View, Text, Pressable } from "react-native";
// See src/app/shopping/[listId].tsx for why ScrollView comes from
// react-native-gesture-handler, not react-native, in this app.
import { ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, PlayCircle, MapPin, ChevronRight } from "lucide-react-native";
import { computeTotals } from "@aislepilot/domain/pricing";
import { computeProgress } from "@aislepilot/domain/progress";
import { useApp } from "../../store/context";
import { usePreferredStore } from "../../lib/use-preferred-store";
import { Card, CardBody, Button, Progress, EmptyState } from "../../components/ui";
import { Logo } from "../../components/Logo";

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, lists } = useApp();
  const { store } = usePreferredStore();

  const active = lists.filter((l) => !l.archived);
  const activeList = active[0];
  const totals = activeList ? computeTotals(activeList) : null;
  const progress = activeList ? computeProgress(activeList) : null;

  return (
    <ScrollView
      className="flex-1 bg-[#f7f8fa]"
      contentContainerClassName="px-4 pb-8"
      contentContainerStyle={{ paddingTop: insets.top + 12 }}
    >
      <View className="mb-5 flex-row items-center justify-between">
        <Logo />
        {profile && <Text className="text-sm text-ink-muted">Hi, {profile.displayName.split(" ")[0]}</Text>}
      </View>

      <Card>
        <CardBody>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <MapPin size={14} color="#6b7688" />
              <Text className="text-xs font-medium uppercase text-ink-muted">Current store</Text>
            </View>
            <Text className="text-xs font-semibold text-brand-700" onPress={() => router.push("/(tabs)/shop")}>
              Change
            </Text>
          </View>
          <Text className="mt-1 text-base font-semibold text-ink">
            {store ? store.name : "No store selected"}
          </Text>
          {store && (
            <Text className="text-sm text-ink-muted">
              {store.city}, {store.state}
            </Text>
          )}
        </CardBody>
      </Card>

      {activeList && totals && progress ? (
        <Card className="mt-4">
          <CardBody>
            <Text className="text-xs font-medium uppercase text-ink-muted">Active list</Text>
            <Text className="mt-1 text-lg font-bold text-ink">{activeList.name}</Text>

            <View className="mt-3">
              <Progress value={progress.percent} />
              <Text className="mt-1.5 text-xs text-ink-muted">
                {progress.collected} of {progress.total} items collected · {progress.remaining} remaining
              </Text>
            </View>

            <View className="mt-4 flex-row justify-between">
              <View>
                <Text className="text-xs text-ink-muted">Estimated</Text>
                <Text className="font-semibold tabular-nums text-ink">
                  ${totals.estimatedTotal.toFixed(2)}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-ink-muted">Collected</Text>
                <Text className="font-semibold tabular-nums text-ink">
                  ${totals.collectedTotal.toFixed(2)}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-ink-muted">Remaining</Text>
                <Text className="font-semibold tabular-nums text-ink">
                  ${totals.remainingTotal.toFixed(2)}
                </Text>
              </View>
            </View>

            <Button
              className="mt-4"
              fullWidth
              size="lg"
              onPress={() => router.push(`/shopping/${activeList.id}`)}
            >
              <View className="flex-row items-center gap-2">
                <PlayCircle size={18} color="#fff" />
                <Text className="font-semibold text-white">Continue Shopping</Text>
              </View>
            </Button>
          </CardBody>
        </Card>
      ) : (
        <View className="mt-4">
          <EmptyState
            title="No lists yet"
            description="Start a list and AislePilot will price it out and route it aisle by aisle."
            action={
              <Button onPress={() => router.push("/(tabs)/lists/new")}>
                <View className="flex-row items-center gap-2">
                  <Plus size={16} color="#fff" />
                  <Text className="font-semibold text-white">Start a list</Text>
                </View>
              </Button>
            }
          />
        </View>
      )}

      <View className="mt-6 flex-row items-center justify-between">
        <Text className="text-base font-bold text-ink">Recent lists</Text>
        <Pressable className="flex-row items-center" onPress={() => router.push("/(tabs)/lists")}>
          <Text className="text-sm font-semibold text-brand-700">See all</Text>
          <ChevronRight size={16} color="#0b7344" />
        </Pressable>
      </View>

      <View className="mt-2 gap-2">
        {lists.slice(0, 4).map((l) => {
          const p = computeProgress(l);
          return (
            <Pressable key={l.id} onPress={() => router.push(`/(tabs)/lists/${l.id}`)}>
              <Card className="mt-1">
                <CardBody className="flex-row items-center justify-between">
                  <View className="flex-shrink">
                    <Text className="font-semibold text-ink">{l.name}</Text>
                    <Text className="text-xs text-ink-muted">
                      {l.items.length} item{l.items.length === 1 ? "" : "s"}
                      {p.total > 0 ? ` · ${p.percent}% done` : ""}
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#6b7688" />
                </CardBody>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
