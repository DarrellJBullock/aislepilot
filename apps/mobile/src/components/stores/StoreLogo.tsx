import { useState } from "react";
import { View, Image } from "react-native";
import { MapPin } from "lucide-react-native";
import type { Store } from "@aislepilot/domain/types";
import { getBannerLogoUrl } from "@aislepilot/domain/branding";

export function StoreLogo({
  store,
  size = 40,
}: {
  store?: Pick<Store, "banner" | "demo">;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const url = store && !store.demo ? getBannerLogoUrl(store.banner) : undefined;

  if (!url || failed) {
    return (
      <View
        className="items-center justify-center rounded-xl bg-brand-100"
        style={{ width: size, height: size }}
      >
        <MapPin size={Math.round(size * 0.45)} color="#0c9152" />
      </View>
    );
  }

  return (
    <View
      className="items-center justify-center overflow-hidden rounded-xl border border-black/5 bg-white"
      style={{ width: size, height: size }}
    >
      <Image
        source={{ uri: url }}
        style={{ width: size - 8, height: size - 8 }}
        resizeMode="contain"
        onError={() => setFailed(true)}
      />
    </View>
  );
}
