// Mirrors src/lib/supabase/client.ts's guarded-client pattern from the web
// app, swapping the browser storage adapter for Expo SecureStore. Returns
// null when env vars are absent so the app falls back to local-only mode
// (mirrors the web app's "mock mode" — see @aislepilot/domain/store/state).
import { Platform } from "react-native";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// SecureStore has a 2048-byte value limit; Supabase sessions can exceed that,
// so large values are chunked across multiple keys.
const CHUNK_SIZE = 1800;

interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const NativeSecureStoreAdapter: StorageAdapter = {
  async getItem(key) {
    const chunkCount = await SecureStore.getItemAsync(`${key}_chunks`);
    if (!chunkCount) return SecureStore.getItemAsync(key);
    const parts = await Promise.all(
      Array.from({ length: Number(chunkCount) }, (_, i) =>
        SecureStore.getItemAsync(`${key}_${i}`),
      ),
    );
    return parts.every((p) => p != null) ? parts.join("") : null;
  },
  async setItem(key, value) {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    await Promise.all(chunks.map((c, i) => SecureStore.setItemAsync(`${key}_${i}`, c)));
    await SecureStore.setItemAsync(`${key}_chunks`, String(chunks.length));
  },
  async removeItem(key) {
    const chunkCount = await SecureStore.getItemAsync(`${key}_chunks`);
    if (chunkCount) {
      await Promise.all(
        Array.from({ length: Number(chunkCount) }, (_, i) =>
          SecureStore.deleteItemAsync(`${key}_${i}`),
        ),
      );
      await SecureStore.deleteItemAsync(`${key}_chunks`);
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// SecureStore is native-only (iOS/Android — the app's target platforms per
// spec). On web it has no working implementation, so fall back to
// AsyncStorage there (its web shim wraps localStorage, no chunking needed).
const storageAdapter: StorageAdapter = Platform.OS === "web" ? AsyncStorage : NativeSecureStoreAdapter;

let client: SupabaseClient | null | undefined;

/** Returns null when Supabase env vars are absent (offline/mock mode). */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    client = null;
    return client;
  }
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: storageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
