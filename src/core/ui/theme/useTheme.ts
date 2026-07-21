import { colorScheme, useColorScheme } from "nativewind";

export type ThemePreference = "light" | "dark" | "system";

/** Reads the effective scheme and exposes the setter for the Profile screen's toggle. */
export function useTheme() {
  const { colorScheme: active } = useColorScheme();

  return {
    active: active ?? "light",
    setPreference: (preference: ThemePreference) => colorScheme.set(preference),
    toggle: () => colorScheme.toggle(),
  };
}
