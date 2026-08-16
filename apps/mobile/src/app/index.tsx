import { View } from "react-native";
import { Redirect } from "expo-router";
import { useApp } from "../store/context";
import { Spinner } from "../components/ui";

export default function Index() {
  const { ready, profile } = useApp();
  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f7f8fa]">
        <Spinner />
      </View>
    );
  }
  return <Redirect href={profile ? "/(tabs)/home" : "/sign-in"} />;
}
