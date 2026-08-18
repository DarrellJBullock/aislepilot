"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  SkipForward,
  Ban,
  Repeat,
  Minus,
  Plus,
  MapPin,
  PartyPopper,
} from "lucide-react";
import { useApp } from "@/lib/store/provider";
import { useStore } from "@/lib/use-store";
import { sortItems } from "@aislepilot/domain/routing";
import { computeProgress } from "@aislepilot/domain/progress";
import { computeTotals, formatCurrency, itemSubtotal } from "@aislepilot/domain/pricing";
import { isResolved } from "@aislepilot/domain/status";
import { useSyncStatus } from "@/services/offline/useSyncStatus";
import {
  Button,
  Progress,
  ProductImage,
  PriceTag,
  AvailabilityPill,
  LocationBadge,
  EmptyState,
} from "@/components/ui";
import { ProductMatchDrawer } from "@/components/products/ProductMatchDrawer";
import { SyncBadge } from "./SyncBadge";
import { cn } from "@/lib/utils";

export function ShoppingMode({ listId }: { listId: string }) {
  const { lists, purchaseHistory, setItemStatus, updateItem, matchItem, restoreItem, recordPurchase } = useApp();
  const list = lists.find((l) => l.id === listId);
  const [cursor, setCursor] = useState(0);
  const [showDone, setShowDone] = useState(false);
  const [substitute, setSubstitute] = useState<string | null>(null);

  const store = useStore(list?.storeId);
  const syncState = useSyncStatus(list?.updatedAt);

  const ordered = useMemo(
    () => (list ? sortItems(list.items.filter((i) => i.product), "route", store) : []),
    [list, store],
  );
  const remaining = ordered.filter((i) => !isResolved(i.status));
  const done = ordered.filter((i) => isResolved(i.status));

  // Record the trip once the whole list resolves — the "AislePilot saves
  // the shopping trip to history" step, which nothing was previously
  // calling. Guarded on both a ref (this mount) and existing history (a
  // later re-entry into an already-completed list) so it only ever fires
  // once per list.
  const purchaseRecordedRef = useRef(false);
  useEffect(() => {
    if (!list || list.items.length === 0 || !list.storeId) return;
    if (remaining.length !== 0) return;
    if (purchaseRecordedRef.current) return;
    if (purchaseHistory.some((h) => h.listId === list.id)) return;
    purchaseRecordedRef.current = true;
    recordPurchase({
      listId: list.id,
      storeId: list.storeId,
      total: computeTotals(list).collectedTotal,
      itemCount: list.items.filter((i) => i.status === "collected").length,
    });
  }, [list, remaining.length, purchaseHistory, recordPurchase]);

  if (!list) {
    return (
      <EmptyState
        title="List not found"
        action={
          <Link href="/dashboard">
            <Button>Back to lists</Button>
          </Link>
        }
      />
    );
  }

  const progress = computeProgress(list);
  const totals = computeTotals(list);
  const focus = remaining[Math.min(cursor, Math.max(0, remaining.length - 1))];
  const allDone = remaining.length === 0;

  const collectorName = list.members.find((m) => m.role === "owner")?.displayName;

  const advance = () => setCursor((c) => (c + 1) % Math.max(1, remaining.length));

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-black/5 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2">
          <Link
            href={`/lists/${list.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={16} /> List
          </Link>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-semibold text-ink">{list.name}</p>
            <p className="truncate text-xs text-ink-muted">{store?.name}</p>
          </div>
          <SyncBadge state={syncState} />
        </div>
        <div className="mx-auto mt-2 max-w-2xl">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>
              {progress.collected}/{progress.total} collected · {remaining.length} left
            </span>
            <span>{progress.percent}%</span>
          </div>
          <Progress value={progress.percent} className="mt-1" label="Shopping progress" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Totals */}
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-black/5 bg-white p-3 text-center shadow-card">
          <div>
            <p className="text-[11px] text-ink-muted">Estimated</p>
            <p className="font-bold tabular-nums text-ink">{formatCurrency(totals.estimatedTotal)}</p>
          </div>
          <div>
            <p className="text-[11px] text-ink-muted">Collected</p>
            <p className="font-bold tabular-nums text-brand-700">
              {formatCurrency(totals.collectedTotal)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-ink-muted">Remaining</p>
            <p className="font-bold tabular-nums text-ink">{formatCurrency(totals.remainingTotal)}</p>
          </div>
        </div>

        {/* Focus card */}
        {allDone ? (
          <div className="mt-4">
            <EmptyState
              icon={<PartyPopper size={44} />}
              title="Trip complete!"
              description="Every item is collected, skipped, or marked unavailable. Nice work."
              action={
                <Link href={`/lists/${list.id}`}>
                  <Button>Back to list</Button>
                </Link>
              }
            />
            <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-brand-50 px-4 py-3">
              <Check size={16} className="text-brand-700" />
              <p className="text-sm font-medium text-brand-800">
                Saved to Purchase history — {formatCurrency(totals.collectedTotal)} ·{" "}
                {done.filter((i) => i.status === "collected").length} item
                {done.filter((i) => i.status === "collected").length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        ) : (
          focus && (
            <div className="mt-4 animate-slide-up rounded-3xl border border-black/5 bg-white p-4 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  Next up
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCursor((c) => Math.max(0, c - 1))}
                    disabled={cursor === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-black/5 disabled:opacity-40"
                    aria-label="Previous item"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-xs text-ink-muted">
                    {Math.min(cursor + 1, remaining.length)}/{remaining.length}
                  </span>
                  <button
                    onClick={advance}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-black/5"
                    aria-label="Next item"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <ProductImage name={focus.product!.name} imageUrl={focus.product!.imageUrl} size={88} />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold leading-tight text-ink">{focus.product!.name}</p>
                  <p className="text-sm text-ink-muted">
                    “{focus.rawText}” · {focus.product!.brand} · {focus.product!.size}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <AvailabilityPill availability={focus.product!.availability} />
                    <LocationBadge source={focus.product!.locationSource} />
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-sm text-ink-soft">
                    <MapPin size={14} />
                    {focus.product!.department}
                    {focus.product!.aisle ? ` · Aisle ${focus.product!.aisle}` : ""}
                    {focus.product!.section ? ` · ${focus.product!.section}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <PriceTag product={focus.product} size="lg" />
                  <p className="mt-1 text-sm font-medium text-ink-muted">
                    ×{focus.quantity} = {formatCurrency(itemSubtotal(focus))}
                  </p>
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => updateItem(list.id, focus.id, { quantity: focus.quantity - 1 })}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 hover:bg-black/5"
                  aria-label="Decrease quantity"
                >
                  <Minus size={18} />
                </button>
                <span className="w-10 text-center text-xl font-bold tabular-nums">
                  {focus.quantity}
                </span>
                <button
                  onClick={() => updateItem(list.id, focus.id, { quantity: focus.quantity + 1 })}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 hover:bg-black/5"
                  aria-label="Increase quantity"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Big actions */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  size="lg"
                  className="col-span-2 h-16 text-base"
                  onClick={() => {
                    setItemStatus(list.id, focus.id, "collected", collectorName);
                    setCursor((c) => Math.max(0, Math.min(c, remaining.length - 2)));
                  }}
                >
                  <Check size={22} /> Collected
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setItemStatus(list.id, focus.id, "skipped");
                    setCursor((c) => Math.max(0, Math.min(c, remaining.length - 2)));
                  }}
                >
                  <SkipForward size={18} /> Skip
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setItemStatus(list.id, focus.id, "unavailable");
                    setCursor((c) => Math.max(0, Math.min(c, remaining.length - 2)));
                  }}
                >
                  <Ban size={18} /> Unavailable
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="col-span-2"
                  onClick={() => setSubstitute(focus.id)}
                >
                  <Repeat size={18} /> Choose substitute
                </Button>
              </div>
            </div>
          )
        )}

        {/* Completed section */}
        {done.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowDone((s) => !s)}
              className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm"
              aria-expanded={showDone}
            >
              <span>Completed ({done.length})</span>
              <ChevronRight
                size={18}
                className={cn("transition-transform", showDone && "rotate-90")}
              />
            </button>
            {showDone && (
              <ul className="mt-2 space-y-2">
                {done.map((i) => (
                  <li
                    key={i.id}
                    className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
                  >
                    <ProductImage name={i.product!.name} imageUrl={i.product!.imageUrl} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink line-through decoration-ink-muted/50">
                        {i.product!.name}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {i.status === "collected"
                          ? `Collected${i.collectedBy ? ` by ${i.collectedBy}` : ""}`
                          : i.status === "skipped"
                            ? "Skipped"
                            : "Unavailable"}
                      </p>
                    </div>
                    <button
                      onClick={() => restoreItem(list.id, i.id)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                    >
                      Undo
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Substitute drawer */}
      {substitute && (
        <ProductMatchDrawer
          open={!!substitute}
          onClose={() => setSubstitute(null)}
          title="Choose a substitute"
          initialQuery={list.items.find((i) => i.id === substitute)?.rawText ?? ""}
          storeId={list.storeId}
          currentProductId={list.items.find((i) => i.id === substitute)?.product?.id}
          onSelect={(product) => {
            matchItem(list.id, substitute, product);
            setSubstitute(null);
          }}
        />
      )}
    </div>
  );
}
