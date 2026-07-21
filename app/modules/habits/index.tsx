import { Stack } from "expo-router";

import { HabitsListScreen } from "@/modules/habits/screens/HabitsListScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HabitsListScreen />
    </>
  );
}
