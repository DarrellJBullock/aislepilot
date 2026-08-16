import { Stack } from "expo-router";

export default function ListsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#f7f8fa" },
        headerShadowVisible: false,
        headerTintColor: "#111826",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: "#f7f8fa" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Lists" }} />
      <Stack.Screen name="[id]" options={{ title: "" }} />
      <Stack.Screen name="new" options={{ title: "New list", presentation: "modal" }} />
    </Stack>
  );
}
