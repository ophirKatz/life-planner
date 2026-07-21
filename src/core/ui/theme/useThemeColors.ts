import { useColorScheme } from "nativewind";

import { getThemeColors } from "@/core/ui/theme/colors";

/** Reactive hex colors for cases that can't take a Tailwind className
 * (icon `color` props, native nav chrome) — see theme/colors.ts. */
export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  return getThemeColors(colorScheme ?? "light");
}
