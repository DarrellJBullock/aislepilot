import { useState } from "react";
import { View, Text, Pressable } from "react-native";
// See src/app/shopping/[listId].tsx for why ScrollView comes from
// react-native-gesture-handler, not react-native, in this app.
import { ScrollView } from "react-native-gesture-handler";
import { UserPlus, X, Users } from "lucide-react-native";
import type { ShoppingList } from "@aislepilot/domain/types";
import { useApp } from "../../store/context";
import { Modal, Input, Button, Badge, Label, FieldError } from "../ui";

export function MembersPanel({
  list,
  open,
  onClose,
}: {
  list: ShoppingList;
  open: boolean;
  onClose: () => void;
}) {
  const { inviteMember, removeMember } = useApp();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const invite = () => {
    const clean = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError("Enter a valid email.");
      return;
    }
    inviteMember(list.id, clean);
    setEmail("");
    setError(null);
  };

  return (
    <Modal open={open} onClose={onClose} title="Share this list">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Text className="mb-3 text-sm text-ink-muted">
          Invite people by email. They can add items and mark things collected — and you&rsquo;ll
          see who grabbed what.
        </Text>

        <Label>Invite by email</Label>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Input
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError(null);
              }}
              onSubmitEditing={invite}
              returnKeyType="done"
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Invite email"
            />
          </View>
          <Button onPress={invite}>
            <View className="flex-row items-center gap-1.5">
              <UserPlus size={16} color="#fff" />
              <Text className="text-sm font-semibold text-white">Invite</Text>
            </View>
          </Button>
        </View>
        <FieldError>{error}</FieldError>

        <View className="mt-5">
          <View className="mb-2 flex-row items-center gap-1.5">
            <Users size={14} color="#3b4557" />
            <Text className="text-sm font-semibold text-ink-soft">Members ({list.members.length})</Text>
          </View>
          <View className="gap-2">
            {list.members.map((m) => (
              <View
                key={m.id}
                className="flex-row items-center justify-between rounded-xl border border-black/5 bg-white p-2.5"
              >
                <View className="min-w-0 flex-1">
                  <Text numberOfLines={1} className="text-sm font-medium text-ink">
                    {m.displayName}
                  </Text>
                  <Text numberOfLines={1} className="text-xs text-ink-muted">
                    {m.email}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Badge tone={m.role === "owner" ? "brand" : "neutral"}>{m.role}</Badge>
                  {m.role !== "owner" && (
                    <Pressable
                      onPress={() => removeMember(list.id, m.id)}
                      accessibilityLabel={`Remove ${m.displayName}`}
                      className="h-7 w-7 items-center justify-center rounded-full"
                    >
                      <X size={16} color="#6b7688" />
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}
