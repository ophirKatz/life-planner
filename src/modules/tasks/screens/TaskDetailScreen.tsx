import { useRouter } from "expo-router";
import { AlertTriangle } from "lucide-react-native";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TaskForm } from "@/modules/tasks/components/TaskForm";
import { useDeleteTask, useTask, useUpdateTask } from "@/modules/tasks/data/useTasks";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";

export function TaskDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: task, isLoading, isError } = useTask(id);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (isError || !task) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
        <EmptyState icon={AlertTriangle} title="Task not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-6">
        <Text className="text-2xl font-semibold text-foreground mb-6">Edit task</Text>
        <TaskForm
          submitLabel="Save changes"
          isSubmitting={updateTask.isPending}
          defaultValues={{
            title: task.title,
            notes: task.notes ?? "",
            priority: task.priority,
            due_at: task.due_at,
            list_id: task.list_id,
          }}
          onSubmit={(values) => {
            updateTask.mutate(
              { id: task.id, patch: { ...values, notes: values.notes || null } },
              { onSuccess: () => router.back() }
            );
          }}
        />

        <Button
          label="Delete task"
          variant="destructive"
          className="mt-4"
          isLoading={deleteTask.isPending}
          onPress={() => deleteTask.mutate(task.id, { onSuccess: () => router.back() })}
        />
      </View>
    </SafeAreaView>
  );
}
