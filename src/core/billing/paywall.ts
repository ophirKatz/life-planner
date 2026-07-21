/** DB triggers (migration 0010) raise "PAYWALL: ..." — this distinguishes
 * that from an ordinary error so the UI can open the paywall instead of
 * just showing a toast. */
export function isPaywallError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "";
  return message.includes("PAYWALL:");
}

/** Presents RevenueCat's prebuilt paywall (react-native-purchases-ui),
 * themed via the RC dashboard to match the app. Requires a development
 * build (DESIGN.md §7.2) — resolves to false gracefully if unavailable. */
export async function presentPaywall(): Promise<boolean> {
  try {
    const { default: RevenueCatUI, PAYWALL_RESULT } = await import("react-native-purchases-ui");
    const result = await RevenueCatUI.presentPaywall();
    return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
  } catch {
    return false;
  }
}
