import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Plus, Rows3, CornerDownLeft } from "lucide-react-native";
import { useApp } from "../../store/context";
import { Button, Input, Textarea } from "../ui";
import { cn } from "../../lib/cn";

export function ItemEntry({ listId }: { listId: string }) {
  const { addItem, addItemsBulk } = useApp();
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [text, setText] = useState("");
  const [qty, setQty] = useState("1");
  const [bulk, setBulk] = useState("");

  const addSingle = () => {
    if (!text.trim()) return;
    addItem(listId, { rawText: text, quantity: Math.max(1, Number(qty) || 1) });
    setText("");
    setQty("1");
  };

  const addBulk = () => {
    if (!bulk.trim()) return;
    addItemsBulk(listId, bulk);
    setBulk("");
    setMode("single");
  };

  return (
    <View className="rounded-2xl border border-black/5 bg-white p-3">
      <View className="mb-2 flex-row items-center gap-2">
        <Pressable
          onPress={() => setMode("single")}
          className={cn("rounded-full px-2.5 py-1", mode === "single" ? "bg-brand-600" : "bg-black/5")}
        >
          <Text className={cn("text-xs font-medium", mode === "single" ? "text-white" : "text-ink-soft")}>
            Quick add
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("bulk")}
          className={cn(
            "flex-row items-center gap-1 rounded-full px-2.5 py-1",
            mode === "bulk" ? "bg-brand-600" : "bg-black/5",
          )}
        >
          <Rows3 size={13} color={mode === "bulk" ? "#fff" : "#3b4557"} />
          <Text className={cn("text-xs font-medium", mode === "bulk" ? "text-white" : "text-ink-soft")}>
            Paste list
          </Text>
        </Pressable>
      </View>

      {mode === "single" ? (
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Input
              value={text}
              onChangeText={setText}
              onSubmitEditing={addSingle}
              returnKeyType="done"
              placeholder="Add an item, e.g. Milk"
              accessibilityLabel="Item name"
            />
          </View>
          <View className="w-14">
            <Input
              value={qty}
              onChangeText={setQty}
              keyboardType="number-pad"
              className="text-center"
              accessibilityLabel="Quantity"
            />
          </View>
          <Button onPress={addSingle} accessibilityLabel="Add item">
            <Plus size={18} color="#fff" />
          </Button>
        </View>
      ) : (
        <View>
          <Textarea
            value={bulk}
            onChangeText={setBulk}
            placeholder={"One item per line, e.g.\nMilk\n2 Eggs\nBread\nPaper towels"}
            className="min-h-[120px]"
            accessibilityLabel="Bulk items"
          />
          <View className="mt-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <CornerDownLeft size={12} color="#6b7688" />
              <Text className="text-xs text-ink-muted">One item per line. Prefix a number for quantity.</Text>
            </View>
            <Button onPress={addBulk} size="sm">
              Add all
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}
