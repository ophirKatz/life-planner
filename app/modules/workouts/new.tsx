import { Stack } from "expo-router";

import { NewWorkoutScreen } from "@/modules/workouts/screens/NewWorkoutScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "New Workout", presentation: "modal" }} />
      <NewWorkoutScreen />
    </>
  );
}
