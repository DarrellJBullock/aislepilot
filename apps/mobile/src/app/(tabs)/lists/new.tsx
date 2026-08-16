import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import type { Store } from "@aislepilot/domain/types";
import { useApp } from "../../../store/context";
import { StorePicker } from "../../../components/stores/StorePicker";
import { Button, Input, Textarea, Label, FieldError, Card, CardBody } from "../../../components/ui";

export default function NewList() {
  const { createList } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [storeId, setStoreId] = useState<string | undefined>();
  const [store, setStore] = useState<Store | undefined>();
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim()) {
      setError("Give your list a name.");
      return;
    }
    const budgetNum = budget ? Number(budget) : undefined;
    const id = createList({
      name,
      budget: budgetNum && budgetNum > 0 ? budgetNum : undefined,
      storeId,
      notes,
    });
    router.replace(`/(tabs)/lists/${id}`);
  };

  return (
    <ScrollView className="flex-1 bg-[#f7f8fa]" contentContainerClassName="p-4 pb-10 gap-4">
      <Card>
        <CardBody className="gap-3">
          <View>
            <Label>List name</Label>
            <Input
              value={name}
              onChangeText={(t) => {
                setName(t);
                setError(null);
              }}
              placeholder="Weekly Groceries"
              autoFocus
            />
            <FieldError>{error}</FieldError>
          </View>
          <View>
            <Label>Budget (optional)</Label>
            <Input
              value={budget}
              onChangeText={setBudget}
              placeholder="75.00"
              keyboardType="decimal-pad"
            />
          </View>
          <View>
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChangeText={setNotes} placeholder="e.g. Dinner party on Saturday" />
          </View>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Label>Store {store ? `— ${store.banner}` : "(optional)"}</Label>
          <Text className="mb-3 text-sm text-ink-muted">
            Choose a store to load its prices, availability, and aisle layout.
          </Text>
          <StorePicker
            value={storeId}
            onChange={(id, s) => {
              setStoreId(id);
              setStore(s);
            }}
          />
        </CardBody>
      </Card>

      <View className="flex-row justify-end gap-2">
        <Button variant="ghost" onPress={() => router.back()}>
          Cancel
        </Button>
        <Button size="lg" onPress={submit}>
          Create list
        </Button>
      </View>
    </ScrollView>
  );
}
