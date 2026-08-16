import { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Search } from "lucide-react-native";
import type { Product } from "@aislepilot/domain/types";
import { searchProducts } from "../../lib/retailer";
import { Modal, Input, Skeleton, EmptyState, Badge } from "../ui";
import { ProductCandidate } from "./ProductCandidate";

export function ProductMatchSheet({
  open,
  onClose,
  initialQuery,
  storeId,
  currentProductId,
  onSelect,
  title = "Match a product",
}: {
  open: boolean;
  onClose: () => void;
  initialQuery: string;
  storeId?: string;
  currentProductId?: string;
  onSelect: (product: Product) => void;
  title?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (open) setQuery(initialQuery);
  }, [open, initialQuery]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await searchProducts(query, storeId);
      if (!active) return;
      setProducts(res.products);
      setOffline(res.offline);
      setLoading(false);
    }, 220);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [open, query, storeId]);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <View className="relative mb-3">
        <Search size={16} color="#6b7688" style={{ position: "absolute", left: 12, top: 14, zIndex: 1 }} />
        <Input
          className="pl-9"
          value={query}
          onChangeText={setQuery}
          placeholder="Search products"
          accessibilityLabel="Search products"
          autoFocus
        />
      </View>

      {offline && (
        <View className="mb-3 flex-row items-center gap-2">
          <Badge tone="amber">Demo</Badge>
          <Text className="text-xs text-ink-muted">Prices & availability are demo data.</Text>
        </View>
      )}

      <ScrollView className="gap-2" showsVerticalScrollIndicator={false}>
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="mb-2 h-[110px] w-full rounded-2xl" />
          ))}

        {!loading && products.length === 0 && (
          <EmptyState title="No matching products" description='Try a simpler term, like "milk" or "bread".' />
        )}

        {!loading &&
          products.map((p) => (
            <View key={p.id} className="mb-2">
              <ProductCandidate
                product={p}
                selected={p.id === currentProductId}
                onSelect={() => {
                  onSelect(p);
                  onClose();
                }}
              />
            </View>
          ))}
      </ScrollView>
    </Modal>
  );
}
