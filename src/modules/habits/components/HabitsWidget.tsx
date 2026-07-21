import { useRouter } from "expo-router";
import { Flame } from "lucide-react-native";
import { Text, View } from "react-native";

import { HabitRow } from "@/modules/habits/components/HabitRow";
import { useHabits } from "@/modules/habits/data/useHabits";
import { CardTitle, PressableCard } from "@/core/ui/Card";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export function HabitsWidget() {
  const router = useRouter();
  const { data: habits, isLoading } = useHabits();
  const colors = useThemeColors();

  return (
    <PressableCard onPress={() => router.push("/modules/habits")}>
      <View className="flex-row items-center gap-2 mb-3">
        <Flame size={18} color={colors.accent} />
        <CardTitle>Habits</CardTitle>
      </View>

      {isLoading ? (
        <Skeleton className="h-12 w-full" />
      ) : !habits || habits.length === 0 ? (
        <Text className="text-sm text-muted-foreground">No habits yet.</Text>
      ) : (
        <View className="gap-2">
          {habits.slice(0, 2).map((habit) => (
            <HabitRow key={habit.id} habit={habit} compact />
          ))}
        </View>
      )}
    </PressableCard>
  );
}
