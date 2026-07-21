import { Stack } from "expo-router";

import { TasksListScreen } from "@/modules/tasks/screens/TasksListScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TasksListScreen />
    </>
  );
}
