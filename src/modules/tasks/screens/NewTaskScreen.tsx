import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCreateTask } from "@/modules/tasks/data/useTasks";
import { TaskForm } from "@/modules/tasks/components/TaskForm";

export function NewTaskScreen() {
  const router = useRouter();
  const createTask = useCreateTask();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-6">
        <Text className="text-2xl font-semibold text-foreground mb-6">New task</Text>
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
      </View>
    </SafeAreaView>
  );
}
