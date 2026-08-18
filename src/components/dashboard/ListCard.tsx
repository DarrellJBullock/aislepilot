"use client";

import Link from "next/link";
import { MapPin, Users, ShoppingBasket } from "lucide-react";
import type { ShoppingList } from "@aislepilot/domain/types";
import { computeTotals, formatCurrency } from "@aislepilot/domain/pricing";
import { computeProgress } from "@aislepilot/domain/progress";
import { useStore } from "@/lib/use-store";
import { Card, Progress, Badge } from "@/components/ui";

export function ListCard({ list }: { list: ShoppingList }) {
  const totals = computeTotals(list);
  const progress = computeProgress(list);
  const store = useStore(list.storeId);

  return (
    <Link href={`/lists/${list.id}`} className="block">
      <Card className="transition-shadow hover:shadow-md">
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-ink">{list.name}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-muted">
                <MapPin size={13} />
                {store ? store.name : "No store selected"}
              </p>
            </div>
            {list.archived && <Badge tone="neutral">Archived</Badge>}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">
                {progress.collected} of {progress.total} collected
              </span>
              <span className="font-medium text-ink">{progress.percent}%</span>
            </div>
            <Progress value={progress.percent} className="mt-1.5" label={`${list.name} progress`} />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1">
                <ShoppingBasket size={13} /> {list.items.length} items
              </span>
              {list.members.length > 1 && (
                <span className="inline-flex items-center gap-1">
                  <Users size={13} /> {list.members.length}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-muted">Estimated</p>
              <p className="font-bold text-brand-700">{formatCurrency(totals.estimatedTotal)}</p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
