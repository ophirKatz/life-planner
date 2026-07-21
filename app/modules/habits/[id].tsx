import { Stack, useLocalSearchParams } from "expo-router";

import { HabitDetailScreen } from "@/modules/habits/screens/HabitDetailScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "Habit" }} />
      <HabitDetailScreen id={id} />
    </>
  );
}
