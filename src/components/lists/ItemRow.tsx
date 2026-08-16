"use client";

import { useState } from "react";
import {
  MapPin,
  Minus,
  Plus,
  Trash2,
  Repeat,
  Tag,
  ChevronDown,
  Flag,
} from "lucide-react";
import type { ShoppingListItem } from "@aislepilot/domain/types";
import { itemSubtotal, formatCurrency } from "@aislepilot/domain/pricing";
import { useApp } from "@/lib/store/provider";
import {
  ProductImage,
  PriceTag,
  StatusPill,
  AvailabilityPill,
  LocationBadge,
  Button,
  Badge,
} from "@/components/ui";
import { ProductMatchDrawer } from "@/components/products/ProductMatchDrawer";
import { cn } from "@/lib/utils";

const PRIORITY_TONE = { low: "neutral", normal: "blue", high: "amber" } as const;

export function ItemRow({
  item,
  storeId,
}: {
  item: ShoppingListItem;
  storeId?: string;
}) {
  const { updateItem, removeItem, matchItem, setItemPriority } = useApp();
  const [drawer, setDrawer] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const p = item.product;

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
      <div className="flex gap-3">
        {p ? (
          <ProductImage name={p.name} imageUrl={p.imageUrl} size={52} />
        ) : (
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-black/5 text-ink-muted">
            <Tag size={20} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">
                {p ? p.name : item.rawText}
              </p>
              {p ? (
                <p className="truncate text-sm text-ink-muted">
                  “{item.rawText}” · {p.brand} · {p.size}
                </p>
              ) : (
                <p className="text-sm text-ink-muted">Not matched yet</p>
              )}
            </div>
            <div className="text-right">
              {p && <PriceTag product={p} size="sm" />}
              {p && (
                <p className="text-xs text-ink-muted">
                  ={formatCurrency(itemSubtotal(item))}
                </p>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusPill status={item.status} />
            {p && <AvailabilityPill availability={p.availability} />}
            {p && <LocationBadge source={p.locationSource} />}
            {item.priority !== "normal" && (
              <Badge tone={PRIORITY_TONE[item.priority]}>
                <Flag size={11} /> {item.priority}
              </Badge>
            )}
            {p?.aisle && (
              <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                <MapPin size={11} /> Aisle {p.aisle}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 rounded-full border border-black/10 p-0.5">
              <button
                onClick={() =>
                  updateItem(item.listId, item.id, { quantity: item.quantity - 1 })
                }
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-semibold tabular-nums">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  updateItem(item.listId, item.id, { quantity: item.quantity + 1 })
                }
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <Button size="sm" variant={p ? "outline" : "primary"} onClick={() => setDrawer(true)}>
                {p ? (
                  <>
                    <Repeat size={14} /> Change
                  </>
                ) : (
                  "Match product"
                )}
              </Button>
              <button
                onClick={() => setExpanded((e) => !e)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-black/5"
                aria-label="More options"
                aria-expanded={expanded}
              >
                <ChevronDown size={16} className={cn("transition-transform", expanded && "rotate-180")} />
              </button>
            </div>
          </div>

          {expanded && (
            <div className="mt-3 space-y-3 border-t border-black/5 pt-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">Notes</label>
                <input
                  className="w-full rounded-lg border border-black/10 px-2.5 py-1.5 text-sm"
                  defaultValue={item.notes}
                  placeholder="e.g. organic if available"
                  onBlur={(e) =>
                    updateItem(item.listId, item.id, { notes: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="mr-1 text-xs font-medium text-ink-soft">Priority</span>
                  {(["low", "normal", "high"] as const).map((pr) => (
                    <button
                      key={pr}
                      onClick={() => setItemPriority(item.listId, item.id, pr)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                        item.priority === pr
                          ? "bg-brand-600 text-white"
                          : "bg-black/5 text-ink-soft",
                      )}
                    >
                      {pr}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => removeItem(item.listId, item.id)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProductMatchDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        initialQuery={item.rawText}
        storeId={storeId}
        currentProductId={p?.id}
        onSelect={(product) => matchItem(item.listId, item.id, product)}
      />
    </div>
  );
}
