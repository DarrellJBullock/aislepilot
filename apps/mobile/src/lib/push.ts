// Expo push-token registration. The server half already exists
// (/api/notifications/notify reads device_push_tokens with the service-role
// client); this is the client half that puts a row there. Best-effort and
// never throws — a device that declines notifications, or an emulator where
// tokens aren't available, must still be fully usable.
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import type { SupabaseClient } from "@supabase/supabase-js";

let lastToken: string | null = null;

async function getExpoPushToken(): Promise<string | null> {
  // Simulators/emulators can't receive pushes, and Expo Go on SDK 53+ can't
  // issue tokens at all — a development build is required.
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (status !== "granted") {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "List activity",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data ?? null;
}

/**
 * Registers this device's Expo push token against the signed-in user.
 * Upserts on the token so reinstalls and account switches replace the row
 * rather than leaving a push aimed at the previous owner of the device.
 */
export async function registerPushToken(
  db: SupabaseClient,
  userId: string,
): Promise<void> {
  try {
    const token = await getExpoPushToken();
    if (!token) return;
    lastToken = token;
    await db.from("device_push_tokens").upsert(
      {
        user_id: userId,
        token,
        platform: Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : "unknown",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "token" },
    );
  } catch {
    // Notifications are strictly additive; never surface a failure here.
  }
}

/** Drops this device's token on sign-out so the next user isn't pushed to. */
export async function unregisterPushToken(db: SupabaseClient): Promise<void> {
  if (!lastToken) return;
  const token = lastToken;
  lastToken = null;
  try {
    await db.from("device_push_tokens").delete().eq("token", token);
  } catch {
    // Ignore — the row is replaced anyway the next time a user registers.
  }
}
