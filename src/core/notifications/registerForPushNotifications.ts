import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { supabase } from "@/core/db/supabase";

/** Requests permission, gets an Expo push token, and upserts it into
 * push_tokens (DESIGN.md §4.2). Physical-device only — the simulator/
 * emulator has no push service to register with. */
export async function registerForPushNotifications(): Promise<void> {
  if (!Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  await supabase.from("push_tokens").upsert(
    {
      user_id: auth.user.id,
      expo_push_token: expoPushToken,
      platform: Platform.OS === "ios" ? "ios" : "android",
    },
    { onConflict: "user_id,expo_push_token" }
  );
}
