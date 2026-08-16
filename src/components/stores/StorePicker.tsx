"use client";

import { useEffect, useState } from "react";
import { MapPin, Search, Check } from "lucide-react";
import type { Store } from "@aislepilot/domain/types";
import { fetchStores } from "@/lib/retailer-client";
import { Input, Skeleton, DemoBadge, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

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
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await fetchStores({ q: query });
      if (!active) return;
      setStores(res.stores);
      setLive(res.live);
      setLoading(false);
    }, 200);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  return (
    <div>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <Input
          className="pl-9"
          placeholder="Search by city, banner, or zip"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search stores"
        />
      </div>

      {!live && (
        <div className="mb-3 flex items-center gap-2 text-xs text-ink-muted">
          <DemoBadge /> Showing fictional demo stores.
        </div>
      )}

      <div className="space-y-2">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />
          ))}

        {!loading && stores.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-muted">No stores found.</p>
        )}

        {!loading &&
          stores.map((store) => {
            const selected = store.id === value;
            return (
              <button
                key={store.id}
                type="button"
                onClick={() => onChange(store.id, store)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                  selected
                    ? "border-brand-500 bg-brand-50"
                    : "border-black/10 bg-white hover:border-brand-300",
                )}
                aria-pressed={selected}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <MapPin size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-semibold text-ink">{store.name}</span>
                    {store.demo && <Badge tone="amber">Demo</Badge>}
                  </span>
                  <span className="block truncate text-sm text-ink-muted">
                    {store.address}, {store.city}, {store.state} {store.zip}
                  </span>
                </span>
                {selected && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
                    <Check size={14} />
                  </span>
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
}
