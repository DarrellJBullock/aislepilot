import type { ReactNode } from "react";
import { Modal as RNModal, View, Text, Pressable } from "react-native";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <RNModal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top || 16 }}>
        <View className="flex-row items-center justify-between border-b border-black/5 px-5 pb-3">
          {title ? <Text className="text-lg font-semibold text-ink">{title}</Text> : <View />}
          <Pressable onPress={onClose} accessibilityLabel="Close" className="rounded-full p-1.5">
            <X size={20} color="#6b7688" />
          </Pressable>
        </View>
        <View className="flex-1 p-4">{children}</View>
      </View>
    </RNModal>
  );
}
