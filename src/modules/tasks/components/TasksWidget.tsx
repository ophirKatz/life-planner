import { useRouter } from "expo-router";
import { ListTodo } from "lucide-react-native";
import { Text, View } from "react-native";

import { useTasks } from "@/modules/tasks/data/useTasks";
import { CardTitle, PressableCard } from "@/core/ui/Card";
import { Skeleton } from "@/core/ui/Skeleton";

export function TasksWidget() {
  const router = useRouter();
  const { data: tasks, isLoading } = useTasks();

  const open = (tasks ?? []).filter((t) => t.status !== "done");
  const nextUp = open.slice(0, 3);

  return (
    <PressableCard onPress={() => router.push("/modules/tasks")}>
      <View className="flex-row items-center gap-2 mb-3">
        <ListTodo size={18} color="#6366f1" />
        <CardTitle>Tasks</CardTitle>
      </View>

      {isLoading ? (
        <View className="gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </View>
      ) : open.length === 0 ? (
        <Text className="text-sm text-muted-foreground">All caught up.</Text>
      ) : (
        <View className="gap-1.5">
          {nextUp.map((task) => (
            <Text key={task.id} className="text-sm text-foreground" numberOfLines={1}>
              • {task.title}
            </Text>
          ))}
          {open.length > nextUp.length ? (
            <Text className="text-sm text-muted-foreground mt-1">
              +{open.length - nextUp.length} more
            </Text>
          ) : null}
        </View>
      )}
    </PressableCard>
  );
}
