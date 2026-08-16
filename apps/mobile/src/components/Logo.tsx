import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import { cn } from "../lib/cn";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <View className={cn("flex-row items-center gap-2", className)}>
      <View className="h-8 w-8 items-center justify-center rounded-xl bg-brand-600">
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.2}>
          <Path d="M3 5h2l2.4 11.2a1 1 0 0 0 1 .8h8.2a1 1 0 0 0 1-.78L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="m11 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
      {showText && (
        <Text className="text-lg font-bold text-ink">
          Aisle<Text className="text-brand-600">Pilot</Text>
        </Text>
      )}
    </View>
  );
}
