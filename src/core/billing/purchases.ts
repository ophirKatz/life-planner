import { Platform } from "react-native";

import { env } from "@/core/config/env";

let didInit = false;

/** Configures the RevenueCat SDK once at app start. Requires a development
 * build — Expo Go only runs the SDK's limited Preview API mode (DESIGN.md
 * §7.2) — and is a no-op if the platform key isn't set yet. */
export async function initPurchases(userId: string): Promise<void> {
  if (didInit) return;
  const apiKey = Platform.OS === "ios" ? env.revenueCatIosKey : env.revenueCatAndroidKey;
  if (!apiKey) return;

  try {
    const Purchases = (await import("react-native-purchases")).default;
    Purchases.configure({ apiKey, appUserID: userId });
    didInit = true;
  } catch {
    // Preview/Expo Go or a platform without the native module — billing
    // features degrade to "unavailable" rather than crashing the app.
  }
}
