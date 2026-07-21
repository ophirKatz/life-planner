import { Stack } from "expo-router";

import { NewHabitScreen } from "@/modules/habits/screens/NewHabitScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "New Habit", presentation: "modal" }} />
      <NewHabitScreen />
    </>
  );
}
