import { FlashList } from "@shopify/flash-list";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { Dumbbell, Plus } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useWorkouts } from "@/modules/workouts/data/useWorkouts";
import type { WorkoutType } from "@/modules/workouts/types";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { ListItem } from "@/core/ui/ListItem";
import { SkeletonListItem } from "@/core/ui/Skeleton";

const TYPE_LABEL: Record<WorkoutType, string> = {
  strength: "Strength",
  cardio: "Cardio",
  yoga: "Yoga",
  other: "Other",
};

export function WorkoutsListScreen() {
  const router = useRouter();
  const { data: workouts, isLoading, isError, refetch } = useWorkouts();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-foreground">Workouts</Text>
        <Button size="icon" variant="secondary" onPress={() => router.push("/modules/workouts/new")}>
          <Plus size={20} />
        </Button>
      </View>

      {isLoading ? (
        <View className="px-6 gap-2 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonListItem key={i} />
          ))}
        </View>
      ) : isError ? (
        <EmptyState
          icon={Dumbbell}
          title="Couldn&apos;t load your workouts"
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : !workouts || workouts.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No workouts logged yet"
          description="Log a workout to start tracking your streak."
          actionLabel="New workout"
          onAction={() => router.push("/modules/workouts/new")}
        />
      ) : (
        <FlashList
          data={workouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item }) => (
            <ListItem
              title={format(new Date(item.workout_date), "EEEE, MMM d")}
              subtitle={`${TYPE_LABEL[item.type as WorkoutType]}${item.duration_minutes ? ` · ${item.duration_minutes} min` : ""}`}
              icon={Dumbbell}
              showChevron
              onPress={() => router.push(`/modules/workouts/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
