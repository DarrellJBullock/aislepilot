import { View, Text, Image } from "react-native";
import { cn } from "../../lib/cn";

const PALETTE = [
  "bg-brand-100",
  "bg-amber-100",
  "bg-blue-100",
  "bg-rose-100",
  "bg-violet-100",
  "bg-emerald-100",
];
const TEXT_TONE = [
  "text-brand-800",
  "text-amber-800",
  "text-blue-800",
  "text-rose-800",
  "text-violet-800",
  "text-emerald-800",
];

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function ProductImage({
  name,
  imageUrl,
  size = 56,
  className,
}: {
  name: string;
  imageUrl?: string;
  size?: number;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        accessibilityLabel={name}
        className={cn("rounded-xl", className)}
        style={{ width: size, height: size }}
        resizeMode="cover"
      />
    );
  }
  const i = hash(name) % PALETTE.length;
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
  return (
    <View
      className={cn("shrink-0 items-center justify-center rounded-xl", PALETTE[i], className)}
      style={{ width: size, height: size }}
      accessibilityElementsHidden
    >
      <Text className={cn("font-semibold", TEXT_TONE[i])} style={{ fontSize: size * 0.32 }}>
        {initials}
      </Text>
    </View>
  );
}
