import { useRouter } from "expo-router";
import { Text } from "react-native";

import { useCreateTask } from "@/modules/tasks/data/useTasks";
import { TaskForm } from "@/modules/tasks/components/TaskForm";

export function NewTaskScreen() {
  const router = useRouter();
  const createTask = useCreateTask();

  return (
    <>
      <Text className="text-lg font-semibold text-foreground text-center mb-4">New task</Text>
      <TaskForm
        submitLabel="Create task"
        isSubmitting={createTask.isPending}
        defaultValues={{ title: "", notes: "", priority: 0, due_at: null, list_id: null }}
        onSubmit={(values) => {
          createTask.mutate(
            { ...values, notes: values.notes || null },
            { onSuccess: () => router.back() }
          );
        }}
      />
    </>
  );
}
