import { Stack, useLocalSearchParams } from "expo-router";

import { WorkoutDetailScreen } from "@/modules/workouts/screens/WorkoutDetailScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "Workout" }} />
      <WorkoutDetailScreen id={id} />
    </>
  );
}
