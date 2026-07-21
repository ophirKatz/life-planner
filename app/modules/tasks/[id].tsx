import { Stack, useLocalSearchParams } from "expo-router";

import { TaskDetailScreen } from "@/modules/tasks/screens/TaskDetailScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "Task" }} />
      <TaskDetailScreen id={id} />
    </>
  );
}
