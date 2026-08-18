import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
// GestureHandlerRootView (root layout) owns touch dispatch app-wide, so a
// plain react-native ScrollView isn't in its recognizer graph and its pan
// gesture is never delivered — swipes land as no-ops. Use gesture-handler's
// own ScrollView, the documented drop-in replacement, everywhere instead.
import { ScrollView } from "react-native-gesture-handler";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  ScanBarcode,
} from "lucide-react-native";
import type { Product } from "@aislepilot/domain/types";
import { useStore } from "../../lib/use-store";
import { sortItems } from "@aislepilot/domain/routing";
import { findBestMatchingItem } from "@aislepilot/domain/matching";
import { computeProgress } from "@aislepilot/domain/progress";
import { computeTotals, formatCurrency, getGroceryTaxRate, itemSubtotal } from "@aislepilot/domain/pricing";
import { isResolved } from "@aislepilot/domain/status";
import { useApp } from "../../store/context";
import { useSyncStatus } from "../../lib/use-sync-status";
import { Button, Progress, ProductImage, PriceTag, AvailabilityPill, LocationBadge, EmptyState } from "../../components/ui";
import { ProductMatchSheet } from "../../components/products/ProductMatchSheet";
import { BarcodeScanner } from "../../components/products/BarcodeScanner";
import { SyncBadge } from "../../components/shopping-mode/SyncBadge";

// A scanned product only auto-matches an unresolved item when confident —
// otherwise it's treated as an off-list scan and added as a new item.
const SCAN_MATCH_THRESHOLD = 0.5;

const cursorKey = (listId: string) => `aislepilot.shoppingCursor.${listId}`;

export default function ShoppingMode() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lists, purchaseHistory, setItemStatus, updateItem, matchItem, addMatchedItem, restoreItem, recordPurchase } =
    useApp();
  const list = lists.find((l) => l.id === listId);
  const [cursor, setCursor] = useState(0);
  const [showDone, setShowDone] = useState(false);
  const [substitute, setSubstitute] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const store = useStore(list?.storeId);
  const syncState = useSyncStatus(list?.updatedAt);

  // Restore/persist trip progress locally so a kill mid-trip doesn't lose your place.
  useEffect(() => {
    if (!listId) return;
    AsyncStorage.getItem(cursorKey(listId)).then((v) => {
      if (v != null) setCursor(Number(v) || 0);
    });
  }, [listId]);
  useEffect(() => {
    if (listId) AsyncStorage.setItem(cursorKey(listId), String(cursor));
  }, [listId, cursor]);

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
      total: computeTotals(list, getGroceryTaxRate(store?.state)).collectedTotalWithTax,
      itemCount: list.items.filter((i) => i.status === "collected").length,
    });
  }, [list, remaining.length, purchaseHistory, recordPurchase, store]);

  if (!list) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f7f8fa] p-4">
        <EmptyState title="List not found" action={<Button onPress={() => router.back()}>Back</Button>} />
      </View>
    );
  }

  const progress = computeProgress(list);
  const totals = computeTotals(list, getGroceryTaxRate(store?.state));
  const focus = remaining[Math.min(cursor, Math.max(0, remaining.length - 1))];
  const allDone = remaining.length === 0;
  const collectorName = list.members.find((m) => m.role === "owner")?.displayName;

  const advance = () => setCursor((c) => (c + 1) % Math.max(1, remaining.length));
  const resolveFocus = (status: "collected" | "skipped" | "unavailable") => {
    if (!focus) return;
    setItemStatus(list.id, focus.id, status, status === "collected" ? collectorName : undefined);
    setCursor((c) => Math.max(0, Math.min(c, remaining.length - 2)));
  };

  // Best-scoring not-yet-resolved item for a scanned product, above the
  // confidence threshold — shared between the scanner's match preview and
  // the actual "mark collected" action so they never disagree.
  const findBestScanMatch = (product: Product) =>
    findBestMatchingItem(
      list.items.filter((i) => !isResolved(i.status)),
      product,
      SCAN_MATCH_THRESHOLD,
    );

  const handleScanFound = (product: Product) => {
    const match = findBestScanMatch(product);
    if (match) {
      matchItem(list.id, match.id, product);
      setItemStatus(list.id, match.id, "collected", collectorName);
    } else {
      addMatchedItem(list.id, product, 1);
    }
  };

  return (
    <View className="flex-1 bg-[#f7f8fa]" style={{ paddingTop: insets.top }}>
      <View className="border-b border-black/5 bg-white/95 px-4 py-3">
        <View className="flex-row items-center justify-between gap-2">
          <Pressable onPress={() => router.back()} className="flex-row items-center gap-1">
            <ArrowLeft size={16} color="#3b4557" />
            <Text className="text-sm font-medium text-ink-soft">List</Text>
          </Pressable>
          <View className="min-w-0 flex-1 items-center px-2">
            <Text numberOfLines={1} className="text-sm font-semibold text-ink">
              {list.name}
            </Text>
            <Text numberOfLines={1} className="text-xs text-ink-muted">
              {store?.name}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => setScanning(true)}
              accessibilityLabel="Scan a barcode"
              className="h-8 w-8 items-center justify-center rounded-full bg-black/5"
            >
              <ScanBarcode size={16} color="#111826" />
            </Pressable>
            <SyncBadge state={syncState} />
          </View>
        </View>
        <View className="mt-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-ink-muted">
              {progress.collected}/{progress.total} collected · {remaining.length} left
            </Text>
            <Text className="text-xs text-ink-muted">{progress.percent}%</Text>
          </View>
          <View className="mt-1">
            <Progress value={progress.percent} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerClassName="px-4 py-4 pb-10">
        <View className="flex-row justify-between rounded-2xl border border-black/5 bg-white p-3">
          <View className="items-center">
            <Text className="text-[11px] text-ink-muted">Estimated</Text>
            <Text className="font-bold text-ink">{formatCurrency(totals.estimatedTotal)}</Text>
          </View>
          <View className="items-center">
            <Text className="text-[11px] text-ink-muted">Collected</Text>
            <Text className="font-bold text-brand-700">{formatCurrency(totals.collectedTotal)}</Text>
          </View>
          <View className="items-center">
            <Text className="text-[11px] text-ink-muted">Remaining</Text>
            <Text className="font-bold text-ink">{formatCurrency(totals.remainingTotal)}</Text>
          </View>
        </View>
        {totals.taxRate > 0 && (
          <View className="mt-2 flex-row items-center justify-between rounded-2xl border border-black/5 bg-white px-3 py-2">
            <Text className="text-xs text-ink-muted">
              Tax ({(totals.taxRate * 100).toFixed(2).replace(/\.?0+$/, "")}%)
            </Text>
            <Text className="text-xs font-semibold text-ink-soft">
              +{formatCurrency(totals.collectedTax)} · Total {formatCurrency(totals.collectedTotalWithTax)}
            </Text>
          </View>
        )}

        {allDone ? (
          <View className="mt-4">
            <EmptyState
              icon={<PartyPopper size={44} color="#18b365" />}
              title="Trip complete!"
              description="Every item is collected, skipped, or marked unavailable. Nice work."
              action={<Button onPress={() => router.back()}>Back to list</Button>}
            />
            {/* Shopping Mode is a full-screen modal — the tab bar (and Saved
                tab, where purchase history lives) isn't reachable from here
                without first going back, so confirm the save happened
                right on this screen instead of leaving the user to go
                hunting for it. */}
            <View className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-brand-50 px-4 py-3">
              <Check size={16} color="#0c9152" />
              <Text className="text-sm font-medium text-brand-800">
                Saved to Purchase history — {formatCurrency(totals.collectedTotalWithTax)} ·{" "}
                {done.filter((i) => i.status === "collected").length} item
                {done.filter((i) => i.status === "collected").length === 1 ? "" : "s"}
              </Text>
            </View>
          </View>
        ) : (
          focus && (
            <View className="mt-4 rounded-3xl border border-black/5 bg-white p-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-xs font-semibold uppercase text-brand-700">Next up</Text>
                <View className="flex-row items-center gap-1">
                  <Pressable
                    onPress={() => setCursor((c) => Math.max(0, c - 1))}
                    disabled={cursor === 0}
                    className="h-8 w-8 items-center justify-center rounded-full"
                    style={{ opacity: cursor === 0 ? 0.4 : 1 }}
                    accessibilityLabel="Previous item"
                  >
                    <ChevronLeft size={18} color="#6b7688" />
                  </Pressable>
                  <Text className="text-xs text-ink-muted">
                    {Math.min(cursor + 1, remaining.length)}/{remaining.length}
                  </Text>
                  <Pressable
                    onPress={advance}
                    className="h-8 w-8 items-center justify-center rounded-full"
                    accessibilityLabel="Next item"
                  >
                    <ChevronRight size={18} color="#6b7688" />
                  </Pressable>
                </View>
              </View>

              <View className="flex-row gap-4">
                <ProductImage name={focus.product!.name} imageUrl={focus.product!.imageUrl} size={88} />
                <View className="min-w-0 flex-1">
                  <Text className="text-lg font-bold leading-tight text-ink">{focus.product!.name}</Text>
                  <Text className="text-sm text-ink-muted">
                    &ldquo;{focus.rawText}&rdquo; · {focus.product!.brand} · {focus.product!.size}
                  </Text>
                  <View className="mt-2 flex-row flex-wrap items-center gap-1.5">
                    <AvailabilityPill availability={focus.product!.availability} />
                    <LocationBadge source={focus.product!.locationSource} />
                  </View>
                  <View className="mt-2 flex-row items-center gap-1">
                    <MapPin size={14} color="#3b4557" />
                    <Text className="text-sm text-ink-soft">
                      {focus.product!.department}
                      {focus.product!.aisle ? ` · Aisle ${focus.product!.aisle}` : ""}
                      {focus.product!.section ? ` · ${focus.product!.section}` : ""}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <PriceTag product={focus.product} size="lg" />
                  <Text className="mt-1 text-sm font-medium text-ink-muted">
                    ×{focus.quantity} = {formatCurrency(itemSubtotal(focus))}
                  </Text>
                </View>
              </View>

              <View className="mt-4 flex-row items-center justify-center gap-4">
                <Pressable
                  onPress={() => updateItem(list.id, focus.id, { quantity: focus.quantity - 1 })}
                  className="h-11 w-11 items-center justify-center rounded-full border border-black/10"
                  accessibilityLabel="Decrease quantity"
                >
                  <Minus size={18} color="#111826" />
                </Pressable>
                <Text className="w-10 text-center text-xl font-bold">{focus.quantity}</Text>
                <Pressable
                  onPress={() => updateItem(list.id, focus.id, { quantity: focus.quantity + 1 })}
                  className="h-11 w-11 items-center justify-center rounded-full border border-black/10"
                  accessibilityLabel="Increase quantity"
                >
                  <Plus size={18} color="#111826" />
                </Pressable>
              </View>

              <View className="mt-4 flex-row flex-wrap gap-2">
                <Button size="lg" className="h-16 w-full" onPress={() => resolveFocus("collected")}>
                  <View className="flex-row items-center gap-2">
                    <Check size={22} color="#fff" />
                    <Text className="text-base font-semibold text-white">Collected</Text>
                  </View>
                </Button>
                <Button size="lg" variant="outline" className="flex-1" onPress={() => resolveFocus("skipped")}>
                  <View className="flex-row items-center gap-2">
                    <SkipForward size={18} color="#111826" />
                    <Text className="text-sm font-semibold text-ink">Skip</Text>
                  </View>
                </Button>
                <Button size="lg" variant="outline" className="flex-1" onPress={() => resolveFocus("unavailable")}>
                  <View className="flex-row items-center gap-2">
                    <Ban size={18} color="#111826" />
                    <Text className="text-sm font-semibold text-ink">Unavailable</Text>
                  </View>
                </Button>
                <Button size="lg" variant="ghost" className="w-full" onPress={() => setSubstitute(focus.id)}>
                  <View className="flex-row items-center gap-2">
                    <Repeat size={18} color="#3b4557" />
                    <Text className="text-sm font-semibold text-ink-soft">Choose substitute</Text>
                  </View>
                </Button>
              </View>
            </View>
          )
        )}

        {done.length > 0 && (
          <View className="mt-6">
            <Pressable
              onPress={() => setShowDone((s) => !s)}
              className="flex-row items-center justify-between rounded-xl bg-white px-4 py-3"
              accessibilityState={{ expanded: showDone }}
            >
              <Text className="text-sm font-semibold text-ink">Completed ({done.length})</Text>
              <ChevronRight
                size={18}
                color="#6b7688"
                style={{ transform: [{ rotate: showDone ? "90deg" : "0deg" }] }}
              />
            </Pressable>
            {showDone && (
              <View className="mt-2 gap-2">
                {done.map((i) => (
                  <View key={i.id} className="flex-row items-center gap-3 rounded-xl bg-white p-3">
                    <ProductImage name={i.product!.name} imageUrl={i.product!.imageUrl} size={40} />
                    <View className="min-w-0 flex-1">
                      <Text numberOfLines={1} className="text-sm font-medium text-ink line-through">
                        {i.product!.name}
                      </Text>
                      <Text className="text-xs text-ink-muted">
                        {i.status === "collected"
                          ? `Collected${i.collectedBy ? ` by ${i.collectedBy}` : ""}`
                          : i.status === "skipped"
                            ? "Skipped"
                            : "Unavailable"}
                      </Text>
                    </View>
                    <Pressable onPress={() => restoreItem(list.id, i.id)} className="rounded-lg px-2 py-1">
                      <Text className="text-xs font-medium text-brand-700">Undo</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <ProductMatchSheet
        open={!!substitute}
        onClose={() => setSubstitute(null)}
        title="Choose a substitute"
        initialQuery={list.items.find((i) => i.id === substitute)?.rawText ?? ""}
        storeId={list.storeId}
        currentProductId={list.items.find((i) => i.id === substitute)?.product?.id}
        onSelect={(product) => {
          if (substitute) matchItem(list.id, substitute, product);
          setSubstitute(null);
        }}
      />

      <BarcodeScanner
        open={scanning}
        onClose={() => setScanning(false)}
        storeId={list.storeId}
        findMatch={(product) => findBestScanMatch(product)?.rawText}
        onFound={handleScanFound}
      />
    </View>
  );
}
