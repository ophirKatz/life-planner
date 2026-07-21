import { useRouter } from "expo-router";
import { AlertTriangle } from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HabitForm } from "@/modules/habits/components/HabitForm";
import { useHabit, useUpdateHabit } from "@/modules/habits/data/useHabits";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";

export function HabitDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: habit, isLoading, isError } = useHabit(id);
  const updateHabit = useUpdateHabit();

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (isError || !habit) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
        <EmptyState icon={AlertTriangle} title="Habit not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-6 gap-4">
        <HabitForm
          submitLabel="Save changes"
          isSubmitting={updateHabit.isPending}
          defaultValues={{
            name: habit.name,
            description: habit.description ?? "",
            cadence: habit.cadence as "daily" | "weekly" | "custom",
            target_per_period: habit.target_per_period,
            color: habit.color,
          }}
          onSubmit={(values) => {
            updateHabit.mutate({
              id: habit.id,
              patch: { ...values, description: values.description || null },
            });
          }}
        />

        <Button
          label="Archive habit"
          variant="destructive"
          isLoading={updateHabit.isPending}
          onPress={() =>
            updateHabit.mutate(
              { id: habit.id, patch: { archived_at: new Date().toISOString() } },
              { onSuccess: () => router.back() }
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}
