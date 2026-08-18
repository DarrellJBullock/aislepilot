import { useState } from "react";
import { Modal, View, Text, Pressable, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import type { Product } from "@aislepilot/domain/types";
import { lookupBarcode } from "../../lib/retailer";
import { ProductCandidate } from "./ProductCandidate";
import { Button } from "../ui";

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  storeId?: string;
  /** Returns a display label if the scanned product best-matches a list item. */
  findMatch?: (product: Product) => string | undefined;
  onFound: (product: Product) => void;
}

/**
 * Full-screen camera scan flow: Scan a UPC -> send to backend -> search
 * Kroger -> show the product (with a "matches '<item>'" hint from the
 * caller) or "Product not found". Never required for normal shopping —
 * this is purely an alternate, faster way to match/collect an item.
 */
export function BarcodeScanner({ open, onClose, storeId, findMatch, onFound }: BarcodeScannerProps) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Product | null | undefined>(undefined); // undefined = no scan yet

  const reset = () => {
    setScanning(true);
    setLoading(false);
    setResult(undefined);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleScanned = async ({ data }: { data: string }) => {
    if (!scanning) return;
    setScanning(false);
    setLoading(true);
    const { product } = await lookupBarcode(data, storeId);
    setLoading(false);
    setResult(product);
  };

  return (
    <Modal visible={open} animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-black">
        {!permission ? null : !permission.granted ? (
          <View className="flex-1 items-center justify-center gap-4 px-8">
            <Text className="text-center text-base text-white">
              AislePilot needs camera access to scan barcodes.
            </Text>
            <Button onPress={requestPermission}>Grant camera access</Button>
            <Pressable onPress={handleClose}>
              <Text className="text-sm font-medium text-white/70">Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ["upc_a", "upc_e", "ean13", "ean8"] }}
              onBarcodeScanned={scanning ? handleScanned : undefined}
            />
            <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
              <View className="h-40 w-64 rounded-2xl border-2 border-white/80" />
              {scanning && !loading && (
                <Text className="mt-4 text-sm font-medium text-white/90">Point at a barcode</Text>
              )}
            </View>
          </>
        )}

        <Pressable
          onPress={handleClose}
          accessibilityLabel="Close scanner"
          className="absolute h-10 w-10 items-center justify-center rounded-full bg-black/50"
          style={{ top: insets.top + 8, left: 16 }}
        >
          <X size={20} color="#fff" />
        </Pressable>

        {(loading || result !== undefined) && (
          <View className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-4" style={{ paddingBottom: insets.bottom + 16 }}>
            {loading ? (
              <View className="flex-row items-center justify-center gap-2 py-6">
                <ActivityIndicator color="#0c9152" />
                <Text className="text-sm text-ink-muted">Looking up product…</Text>
              </View>
            ) : result ? (
              <View className="gap-3">
                {findMatch?.(result) && (
                  <Text className="text-sm font-medium text-brand-700">
                    Matches “{findMatch(result)}” on your list
                  </Text>
                )}
                <ProductCandidate
                  product={result}
                  onSelect={() => {
                    onFound(result);
                    handleClose();
                  }}
                />
                <Pressable onPress={reset} className="items-center py-1">
                  <Text className="text-sm font-medium text-ink-soft">Scan another</Text>
                </Pressable>
              </View>
            ) : (
              <View className="items-center gap-3 py-2">
                <Text className="text-base font-semibold text-ink">Product not found</Text>
                <Text className="text-center text-sm text-ink-muted">
                  This barcode didn't match anything at your store.
                </Text>
                <View className="mt-1 w-full flex-row gap-2">
                  <View className="flex-1">
                    <Button variant="secondary" fullWidth onPress={reset}>
                      Scan again
                    </Button>
                  </View>
                  <View className="flex-1">
                    <Button fullWidth onPress={handleClose}>
                      Add manually
                    </Button>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}
