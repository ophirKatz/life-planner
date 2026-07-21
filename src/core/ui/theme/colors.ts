// Hex mirrors of the HSL tokens in global.css, for native-navigation chrome
// (tab bar, headers) that can't consume Tailwind classes directly.
export const themeColors = {
  light: {
    bg: "#ffffff",
    surface: "#ffffff",
    border: "#dde1e6",
    foreground: "#1c1e21",
    mutedForeground: "#6b7280",
    accent: "#5b57f0",
    danger: "#dc2626",
    muted: "#e9ebef",
  },
  dark: {
    bg: "#0d0f14",
    surface: "#14171e",
    border: "#2a2e37",
    foreground: "#f2f3f5",
    mutedForeground: "#9aa0ab",
    accent: "#8b87f5",
    danger: "#f87171",
    muted: "#22262f",
  },
} as const;

export function getThemeColors(scheme: "light" | "dark") {
  return themeColors[scheme];
}
