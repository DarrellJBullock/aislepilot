import { View } from "react-native";
import { cn } from "../../lib/cn";

export function Progress({
  value,
  className,
}: {
  value: number; // 0-100
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-black/10", className)}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: pct }}
    >
      <View className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
    </View>
  );
}
