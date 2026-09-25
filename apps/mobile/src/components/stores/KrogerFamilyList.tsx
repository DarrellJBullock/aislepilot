import { View, Text } from "react-native";
import { KROGER_FAMILY_BANNERS } from "@aislepilot/domain/branding";
import { StoreLogo } from "./StoreLogo";

/** Every Kroger-family banner with its logo and where it operates. */
export function KrogerFamilyList() {
  return (
    <View className="gap-2">
      {KROGER_FAMILY_BANNERS.map((b) => (
        <View
          key={b.code}
          className="flex-row items-center gap-3 rounded-xl border border-black/5 bg-white p-2.5"
        >
          <StoreLogo store={{ banner: b.code, demo: false }} size={32} />
          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className="text-sm font-semibold text-ink">
              {b.name}
            </Text>
            <Text numberOfLines={1} className="text-xs text-ink-muted">
              {b.region}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
