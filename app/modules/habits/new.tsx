import { Stack } from "expo-router";

import { NewHabitScreen } from "@/modules/habits/screens/NewHabitScreen";
import { RouteSheet } from "@/core/ui/RouteSheet";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "transparentModal", animation: "none" }} />
      <RouteSheet>
        <NewHabitScreen />
      </RouteSheet>
    </>
  );
}
