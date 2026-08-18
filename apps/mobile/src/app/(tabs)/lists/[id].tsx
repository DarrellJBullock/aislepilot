import { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
// See src/app/shopping/[listId].tsx for why ScrollView comes from
// react-native-gesture-handler, not react-native, in this app.
import { ScrollView } from "react-native-gesture-handler";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MapPin, MoreVertical, ShoppingCart, Users } from "lucide-react-native";
import { useApp } from "../../../store/context";
import { useStore } from "../../../lib/use-store";
import { Button, Badge, EmptyState, Modal, Input, Label } from "../../../components/ui";
import { TotalsSummary } from "../../../components/lists/TotalsSummary";
import { ItemEntry } from "../../../components/lists/ItemEntry";
import { ItemList } from "../../../components/lists/ItemList";
import { StorePicker } from "../../../components/stores/StorePicker";
import { StoreLogo } from "../../../components/stores/StoreLogo";
import { MembersPanel } from "../../../components/collaboration/MembersPanel";

export default function ListDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lists, updateList, deleteList, duplicateList } = useApp();
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [pickingStore, setPickingStore] = useState(false);
  const [sharing, setSharing] = useState(false);

  const list = lists.find((l) => l.id === id);
  const store = useStore(list?.storeId);

  if (!list) {
    return (
      <View className="flex-1 bg-[#f7f8fa] p-4">
        <EmptyState
          title="List not found"
          description="It may have been deleted."
          action={<Button onPress={() => router.replace("/(tabs)/lists")}>Back to lists</Button>}
        />
      </View>
    );
  }

  const matchedCount = list.items.filter((i) => i.product).length;
  const canShop = matchedCount > 0 && !!store;

  const openMenu = () => {
    Alert.alert(list.name, undefined, [
      {
        text: "Rename",
        onPress: () => {
          setNameDraft(list.name);
          setRenaming(true);
        },
      },
      {
        text: "Duplicate",
        onPress: () => {
          const newId = duplicateList(list.id);
          router.replace(`/(tabs)/lists/${newId}`);
        },
      },
      {
        text: list.archived ? "Unarchive" : "Archive",
        onPress: () => updateList(list.id, { archived: !list.archived }),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          Alert.alert("Delete list?", "This can't be undone.", [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                deleteList(list.id);
                router.replace("/(tabs)/lists");
              },
            },
          ]),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-[#f7f8fa]" contentContainerClassName="p-4 pb-10 gap-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-2xl font-bold text-ink">{list.name}</Text>
          <View className="mt-1 flex-row flex-wrap items-center gap-2">
            {store ? (
              <View className="flex-row items-center gap-1.5">
                <StoreLogo store={store} size={20} />
                <Text className="text-sm text-ink-muted">{store.name}</Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-1">
                <MapPin size={13} color="#6b7688" />
                <Text className="text-sm text-ink-muted">No store selected</Text>
              </View>
            )}
            {store?.demo && <Badge tone="amber">Demo data</Badge>}
          </View>
          {list.notes ? <Text className="mt-1 text-sm text-ink-soft">{list.notes}</Text> : null}
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => setSharing(true)}
            accessibilityLabel="Share this list"
            className="h-9 w-9 items-center justify-center rounded-full bg-black/5"
          >
            <Users size={18} color="#111826" />
          </Pressable>
          <Pressable onPress={openMenu} accessibilityLabel="List options" className="h-9 w-9 items-center justify-center rounded-full bg-black/5">
            <MoreVertical size={18} color="#111826" />
          </Pressable>
        </View>
      </View>

      <TotalsSummary list={list} store={store} />

      {canShop ? (
        <Button fullWidth size="lg" onPress={() => router.push(`/shopping/${list.id}`)}>
          <View className="flex-row items-center gap-2">
            <ShoppingCart size={18} color="#fff" />
            <Text className="font-semibold text-white">Start Shopping Mode</Text>
          </View>
        </Button>
      ) : (
        <Pressable
          onPress={() => {
            if (!store) setPickingStore(true);
          }}
          className="rounded-xl bg-brand-50 px-3 py-2.5"
        >
          <Text className="text-sm text-brand-800">
            {!store
              ? "Tap to pick a store, then match a product to start Shopping Mode."
              : "Match at least one product to start Shopping Mode."}
          </Text>
        </Pressable>
      )}

      <ItemEntry listId={list.id} />
      <ItemList list={list} />

      <Modal open={pickingStore} onClose={() => setPickingStore(false)} title="Choose a store">
        <StorePicker
          value={list.storeId}
          onChange={(storeId) => {
            updateList(list.id, { storeId });
            setPickingStore(false);
          }}
        />
      </Modal>

      <Modal open={renaming} onClose={() => setRenaming(false)} title="Rename list">
        <Label>List name</Label>
        <Input value={nameDraft} onChangeText={setNameDraft} autoFocus />
        <Button
          className="mt-4"
          fullWidth
          onPress={() => {
            if (nameDraft.trim()) updateList(list.id, { name: nameDraft.trim() });
            setRenaming(false);
          }}
        >
          Save
        </Button>
      </Modal>

      <MembersPanel list={list} open={sharing} onClose={() => setSharing(false)} />
    </ScrollView>
  );
}
