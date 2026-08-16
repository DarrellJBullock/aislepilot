"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import type { ShoppingList, ItemStatus } from "@aislepilot/domain/types";
import { sortItems, groupByDepartment, type SortMode } from "@aislepilot/domain/routing";
import { findStore } from "@aislepilot/domain/mock/stores";
import { EmptyState } from "@/components/ui";
import { ItemRow } from "./ItemRow";

type StatusFilter = "all" | "unmatched" | "matched" | ItemStatus;

const SORTS: { value: SortMode; label: string }[] = [
  { value: "route", label: "Store route" },
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
  const store = list.storeId ? findStore(list.storeId) : undefined;

  const filtered = useMemo(() => {
    if (filter === "all") return list.items;
    if (filter === "unmatched") return list.items.filter((i) => i.status === "unmatched");
    return list.items.filter((i) => i.status === filter);
  }, [list.items, filter]);

  const sorted = useMemo(() => sortItems(filtered, sort, store), [filtered, sort, store]);
  const groups = useMemo(
    () => (sort === "route" ? groupByDepartment(sorted, store) : null),
    [sorted, sort, store],
  );

  if (list.items.length === 0) {
    return (
      <EmptyState
        title="No items yet"
        description="Add items above to start matching products."
      />
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                filter === f.value ? "bg-brand-600 text-white" : "bg-black/5 text-ink-soft"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
          <ArrowUpDown size={14} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="rounded-lg border border-black/10 bg-white px-2 py-1 text-sm"
            aria-label="Sort items"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nothing matches this filter" />
      ) : groups ? (
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.department}>
              <h3 className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                {g.department}
                <span className="rounded-full bg-black/5 px-1.5 text-xs font-normal">
                  {g.items.length}
                </span>
              </h3>
              <div className="space-y-2">
                {g.items.map((item) => (
                  <ItemRow key={item.id} item={item} storeId={list.storeId} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((item) => (
            <ItemRow key={item.id} item={item} storeId={list.storeId} />
          ))}
        </div>
      )}
    </div>
  );
}
