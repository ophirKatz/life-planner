import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useHabitLogs, useToggleHabitToday } from "@/modules/habits/data/useHabitLogs";
import { computeStreak, todayKey } from "@/modules/habits/streaks";
import type { HabitRow as HabitRowType } from "@/modules/habits/types";
import { emit } from "@/core/events/bus";
import { ConfettiBurst } from "@/core/ui/ConfettiBurst";
import { StreakRing } from "@/core/ui/StreakRing";

export function HabitRow({ habit, compact }: { habit: HabitRowType; compact?: boolean }) {
  const router = useRouter();
  const { data: logs } = useHabitLogs(habit.id);
  const toggleToday = useToggleHabitToday(habit.id);
  const [burstKey, setBurstKey] = useState(0);

  const isCheckedToday = (logs ?? []).some((log) => log.date === todayKey());
  const streak = computeStreak((logs ?? []).map((l) => l.date));

  const onToggle = () => {
    const wasChecked = isCheckedToday;
    toggleToday.mutate(wasChecked);
    if (!wasChecked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setBurstKey((k) => k + 1);
      emit({ type: "habit.completed", habitId: habit.id });
    } else {
      Haptics.selectionAsync();
    }
  };

  const Container = compact ? View : Pressable;

  return (
    <Container
      className="relative flex-row items-center gap-3 rounded-2xl bg-surface border border-border p-3.5 active:opacity-80"
      {...(compact ? {} : { onPress: () => router.push(`/modules/habits/${habit.id}`) })}
    >
      <Pressable onPress={onToggle} hitSlop={8}>
        <StreakRing progress={isCheckedToday ? 1 : 0} streak={streak} color={habit.color} size={48} />
        <ConfettiBurst triggerKey={burstKey} />
      </Pressable>

      <View className="flex-1">
        <Text className="text-base font-medium text-foreground">{habit.name}</Text>
        <Text className="text-sm text-muted-foreground">
          {streak > 0 ? `${streak} day streak` : "No streak yet"}
        </Text>
      </View>
    </Container>
  );
}
