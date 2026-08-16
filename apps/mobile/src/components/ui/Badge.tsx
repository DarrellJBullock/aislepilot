import { View, Text, type ViewProps } from "react-native";
import { cn } from "../../lib/cn";

type Tone = "neutral" | "brand" | "amber" | "red" | "blue" | "green";

const TONES: Record<Tone, { bg: string; text: string }> = {
  neutral: { bg: "bg-black/5", text: "text-ink-soft" },
  brand: { bg: "bg-brand-50", text: "text-brand-800" },
  amber: { bg: "bg-amber-100", text: "text-amber-800" },
  red: { bg: "bg-red-100", text: "text-red-700" },
  blue: { bg: "bg-blue-100", text: "text-blue-700" },
  green: { bg: "bg-green-100", text: "text-green-700" },
};

export function Badge({
  tone = "neutral",
  className,
  children,
  ...props
}: ViewProps & { tone?: Tone; children: React.ReactNode }) {
  const t = TONES[tone];
  return (
    <View
      className={cn("flex-row items-center gap-1 self-start rounded-full px-2 py-0.5", t.bg, className)}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className={cn("text-xs font-medium", t.text)}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
