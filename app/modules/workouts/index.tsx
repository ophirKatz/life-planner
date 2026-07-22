import { Stack } from "expo-router";

import { WorkoutsListScreen } from "@/modules/workouts/screens/WorkoutsListScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WorkoutsListScreen />
    </>
  );
}
