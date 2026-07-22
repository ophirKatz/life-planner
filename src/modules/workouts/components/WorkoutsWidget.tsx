import { format, startOfWeek, subDays } from "date-fns";
import { useRouter } from "expo-router";
import { Dumbbell } from "lucide-react-native";
import { Text, View } from "react-native";

import { useWorkouts } from "@/modules/workouts/data/useWorkouts";
import { CardTitle, PressableCard } from "@/core/ui/Card";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

const DAY_FORMAT = "yyyy-MM-dd";

/** Consecutive-day streak ending today, with a one-day grace period —
 * mirrors the habits module's computeStreak but kept local since it's a
 * few lines and modules don't import each other's internals. */
function computeStreak(dates: string[]): number {
  const set = new Set(dates);
  let cursor = new Date();
  if (!set.has(format(cursor, DAY_FORMAT))) cursor = subDays(cursor, 1);

  let streak = 0;
  while (set.has(format(cursor, DAY_FORMAT))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export function WorkoutsWidget() {
  const router = useRouter();
  const { data: workouts, isLoading } = useWorkouts();
  const colors = useThemeColors();

  const weekStart = startOfWeek(new Date());
  const thisWeek = (workouts ?? []).filter((w) => new Date(w.workout_date) >= weekStart);
  const streak = computeStreak((workouts ?? []).map((w) => w.workout_date));

  return (
    <PressableCard onPress={() => router.push("/modules/workouts")}>
      <View className="flex-row items-center gap-2 mb-3">
        <Dumbbell size={18} color={colors.accent} />
        <CardTitle>Workouts</CardTitle>
      </View>

      {isLoading ? (
        <Skeleton className="h-4 w-2/3" />
      ) : (
        <View className="gap-1">
          <Text className="text-sm text-foreground">
            {thisWeek.length} workout{thisWeek.length === 1 ? "" : "s"} this week
          </Text>
          {streak > 0 ? <Text className="text-sm text-muted-foreground">{streak} day streak</Text> : null}
        </View>
      )}
    </PressableCard>
  );
}
