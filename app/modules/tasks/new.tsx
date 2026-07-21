import { Stack } from "expo-router";

import { NewTaskScreen } from "@/modules/tasks/screens/NewTaskScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "New Task", presentation: "modal" }} />
      <NewTaskScreen />
    </>
  );
}
