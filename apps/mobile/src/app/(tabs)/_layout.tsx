import { Tabs } from "expo-router";
import { Home, ClipboardList, ShoppingCart, Bookmark } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0c9152",
        tabBarInactiveTintColor: "#6b7688",
        tabBarStyle: { backgroundColor: "#ffffff", borderTopColor: "rgba(0,0,0,0.06)" },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: "Home", tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: "Lists",
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{ title: "Saved", tabBarIcon: ({ color, size }) => <Bookmark color={color} size={size} /> }}
      />
    </Tabs>
  );
}
