import { Stack } from "expo-router";

// Thin router shell for every module's screens (src/modules/<slug>/screens/*),
// pushed on top of the tab shell. Per-screen titles are set by each screen file.
export default function ModulesLayout() {
  return <Stack screenOptions={{ headerShown: true, headerBackTitle: "Back" }} />;
}
