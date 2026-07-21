import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Check, ListTodo, Plus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTasks, useToggleTaskDone } from "@/modules/tasks/data/useTasks";
import type { TaskRow } from "@/modules/tasks/types";
import { Button } from "@/core/ui/Button";
import { Checkbox } from "@/core/ui/Checkbox";
import { EmptyState } from "@/core/ui/EmptyState";
import { SkeletonListItem } from "@/core/ui/Skeleton";
import { SwipeableRow } from "@/core/ui/SwipeableRow";

const priorityColor = ["transparent", "#facc15", "#fb923c", "#ef4444"];

function TaskRowItem({ task }: { task: TaskRow }) {
  const router = useRouter();
  const toggleDone = useToggleTaskDone();
  const isDone = task.status === "done";

  return (
    <SwipeableRow actionLabel="Done" actionIcon={Check} onTrigger={() => toggleDone.mutate(task)}>
      <Pressable
        className="flex-row items-center gap-3 bg-bg px-6 py-3.5 active:opacity-70"
        onPress={() => router.push(`/modules/tasks/${task.id}`)}
      >
        <Checkbox checked={isDone} onCheckedChange={() => toggleDone.mutate(task)} />
        <View className="flex-1">
          <Text
            className={`text-base ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}
            numberOfLines={1}
          >
            {task.title}
          </Text>
        </View>
        {task.priority > 0 ? (
          <View
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: priorityColor[task.priority] }}
          />
        ) : null}
      </Pressable>
    </SwipeableRow>
  );
}

export function TasksListScreen() {
  const router = useRouter();
  const { data: tasks, isLoading, isError, refetch } = useTasks();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-foreground">Tasks</Text>
        <Button size="icon" variant="secondary" onPress={() => router.push("/modules/tasks/new")}>
          <Plus size={20} />
        </Button>
      </View>

      {isLoading ? (
        <View className="px-6 gap-2 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonListItem key={i} />
          ))}
        </View>
      ) : isError ? (
        <EmptyState
          icon={ListTodo}
          title="Couldn't load tasks"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : !tasks || tasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks yet"
          description="Add your first task to get started."
          actionLabel="New task"
          onAction={() => router.push("/modules/tasks/new")}
        />
      ) : (
        <FlashList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TaskRowItem task={item} />}
        />
      )}
    </SafeAreaView>
  );
}
