import { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import type { ShoppingList, ItemStatus } from "@aislepilot/domain/types";
import { sortItems, groupByDepartment, type SortMode } from "@aislepilot/domain/routing";
import { EmptyState } from "../ui";
import { ItemRow } from "./ItemRow";
import { cn } from "../../lib/cn";
import { useStore } from "../../lib/use-store";

type StatusFilter = "all" | "unmatched" | ItemStatus;

const SORTS: { value: SortMode; label: string }[] = [
  { value: "route", label: "Route" },
  { value: "price", label: "Price" },
  { value: "name", label: "Name" },
];

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unmatched", label: "Needs match" },
  { value: "available", label: "Ready" },
  { value: "collected", label: "Collected" },
];

export function ItemList({ list }: { list: ShoppingList }) {
  const [sort, setSort] = useState<SortMode>("route");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const store = useStore(list.storeId);

  const filtered = useMemo(
    () => (filter === "all" ? list.items : list.items.filter((i) => i.status === filter)),
    [list.items, filter],
  );
  const sorted = useMemo(() => sortItems(filtered, sort, store), [filtered, sort, store]);
  const groups = useMemo(() => (sort === "route" ? groupByDepartment(sorted, store) : null), [sorted, sort, store]);

  if (list.items.length === 0) {
    return <EmptyState title="No items yet" description="Add items above to start matching products." />;
  }

  return (
    <View>
      <View className="mb-3 flex-row flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Pressable
            key={f.value}
            onPress={() => setFilter(f.value)}
            className={cn("rounded-full px-2.5 py-1", filter === f.value ? "bg-brand-600" : "bg-black/5")}
          >
            <Text className={cn("text-xs font-medium", filter === f.value ? "text-white" : "text-ink-soft")}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <View className="mb-3 flex-row items-center gap-1.5">
        <Text className="text-xs text-ink-muted">Sort:</Text>
        {SORTS.map((s) => (
          <Pressable
            key={s.value}
            onPress={() => setSort(s.value)}
            className={cn("rounded-full px-2.5 py-1", sort === s.value ? "bg-ink" : "bg-black/5")}
          >
            <Text className={cn("text-xs font-medium", sort === s.value ? "text-white" : "text-ink-soft")}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyState title="Nothing matches this filter" />
      ) : groups ? (
        <View className="gap-5">
          {groups.map((g) => (
            <View key={g.department}>
              <View className="mb-2 flex-row items-center gap-2 px-1">
                <Text className="text-sm font-semibold uppercase text-ink-muted">{g.department}</Text>
                <View className="rounded-full bg-black/5 px-1.5">
                  <Text className="text-xs text-ink-muted">{g.items.length}</Text>
                </View>
              </View>
              <View className="gap-2">
                {g.items.map((item) => (
                  <ItemRow key={item.id} item={item} storeId={list.storeId} />
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="gap-2">
          {sorted.map((item) => (
            <ItemRow key={item.id} item={item} storeId={list.storeId} />
          ))}
        </View>
      )}
    </View>
  );
}
