import { useEffect, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Search, Check, LocateFixed } from "lucide-react-native";
import * as Location from "expo-location";
import type { Store } from "@aislepilot/domain/types";
import { searchStores } from "../../lib/retailer";
import { Input, Skeleton, Badge } from "../ui";
import { StoreLogo } from "./StoreLogo";
import { cn } from "../../lib/cn";

export function StorePicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (storeId: string, store: Store) => void;
}) {
  const [stores, setStores] = useState<Store[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await searchStores({ query });
      if (!active) return;
      setStores(res.stores);
      setOffline(res.offline);
      setLoading(false);
    }, 200);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  // "Near me" is opt-in only, tapped explicitly — never requested at launch.
  const useMyLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location unavailable",
          "Enable location access, or search by ZIP code instead.",
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      if (place?.postalCode) setQuery(place.postalCode);
    } catch {
      Alert.alert("Couldn't get your location", "Try searching by ZIP code instead.");
    } finally {
      setLocating(false);
    }
  };

  return (
    <View>
      <View className="mb-2 flex-row items-center gap-2">
        <View className="relative flex-1">
          <Search size={16} color="#6b7688" style={{ position: "absolute", left: 12, top: 14, zIndex: 1 }} />
          <Input
            className="pl-9"
            placeholder="Search by city, banner, or ZIP"
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Search stores"
          />
        </View>
        <Pressable
          onPress={useMyLocation}
          disabled={locating}
          className="h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white"
          accessibilityLabel="Use my location"
        >
          <LocateFixed size={18} color="#0c9152" />
        </Pressable>
      </View>

      {offline && (
        <View className="mb-3 flex-row items-center gap-2">
          <Badge tone="amber">Demo</Badge>
          <Text className="text-xs text-ink-muted">Showing fictional demo stores.</Text>
        </View>
      )}

      <View className="gap-2">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />)}

        {!loading && stores.length === 0 && (
          <Text className="py-6 text-center text-sm text-ink-muted">No stores found.</Text>
        )}

        {!loading &&
          stores.map((store) => {
            const selected = store.id === value;
            return (
              <Pressable
                key={store.id}
                onPress={() => onChange(store.id, store)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={cn(
                  "flex-row items-center gap-3 rounded-2xl border p-3",
                  selected ? "border-brand-500 bg-brand-50" : "border-black/10 bg-white",
                )}
              >
                <StoreLogo store={store} size={40} />
                <View className="min-w-0 flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text numberOfLines={1} className="flex-shrink font-semibold text-ink">
                      {store.name}
                    </Text>
                    {store.demo && <Badge tone="amber">Demo</Badge>}
                  </View>
                  <Text numberOfLines={1} className="text-sm text-ink-muted">
                    {store.address}, {store.city}, {store.state} {store.zip}
                  </Text>
                </View>
                {selected && (
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-600">
                    <Check size={14} color="#fff" />
                  </View>
                )}
              </Pressable>
            );
          })}
      </View>
    </View>
  );
}
