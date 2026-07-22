import { Stack } from "expo-router";

import { FocusScreen } from "@/modules/focus/screens/FocusScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FocusScreen />
    </>
  );
}
