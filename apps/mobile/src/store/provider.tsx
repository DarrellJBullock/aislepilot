import type { ReactNode } from "react";
import { View, Text } from "react-native";
import { isSupabaseConfigured } from "../lib/supabase";
import { SupabaseAppProvider } from "./supabase-provider";

export { useApp } from "./context";
export type { AppContextValue } from "./context";

/**
 * This milestone requires Supabase for auth + list persistence (the web
 * app's localStorage mock-mode fallback isn't ported to mobile yet — see
 * ARCHITECTURE.md). Retailer data (stores/products) still works fully
 * offline via MockKrogerProvider regardless — see ../lib/retailer.ts.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <View className="flex-1 items-center justify-center bg-[#f7f8fa] px-8">
        <Text className="text-center text-lg font-bold text-ink">Supabase not configured</Text>
        <Text className="mt-2 text-center text-sm text-ink-muted">
          Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in apps/mobile/.env to
          sign in and manage lists. Store and product browsing works without them.
        </Text>
      </View>
    );
  }
  return <SupabaseAppProvider>{children}</SupabaseAppProvider>;
}
