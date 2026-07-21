import { useRouter } from "expo-router";
import { AlertTriangle, BellRing, Calendar, Users } from "lucide-react-native";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LinkEntityButton } from "@/core/links/LinkEntityButton";
import { LinkedItemsSection } from "@/core/links/LinkedItemsSection";
import { useScheduleReminder } from "@/core/notifications/useScheduleReminder";
import { TaskForm } from "@/modules/tasks/components/TaskForm";
import { useDeleteTask, useTask, useUpdateTask } from "@/modules/tasks/data/useTasks";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";

export function TaskDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: task, isLoading, isError } = useTask(id);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const scheduleReminder = useScheduleReminder();

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
      <ScrollView contentContainerClassName="px-6 pt-4 pb-10">
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

        <View className="flex-row flex-wrap gap-2 mt-6">
          <LinkEntityButton
            label="Link a person"
            icon={Users}
            pickerTitle="Link a person"
            sourceType="task"
            sourceId={task.id}
            targetType="person"
            relType="related"
          />
          <LinkEntityButton
            label="Schedule as event"
            icon={Calendar}
            pickerTitle="Schedule as event"
            sourceType="task"
            sourceId={task.id}
            targetType="calendar_event"
            relType="scheduled_as"
          />
          {task.due_at ? (
            <Button
              variant="secondary"
              isLoading={scheduleReminder.isPending}
              onPress={() =>
                scheduleReminder.mutate({
                  title: task.title,
                  body: "Due now",
                  deliverAt: new Date(task.due_at as string),
                  data: { entityType: "task", entityId: task.id },
                })
              }
            >
              <BellRing size={16} color="#1c1e21" />
              <Text className="text-base font-medium text-foreground">Remind me</Text>
            </Button>
          ) : null}
        </View>

        <View className="mt-6">
          <LinkedItemsSection entityType="task" entityId={task.id} />
        </View>

        <Button
          label="Delete task"
          variant="destructive"
          className="mt-6"
          isLoading={deleteTask.isPending}
          onPress={() => deleteTask.mutate(task.id, { onSuccess: () => router.back() })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
