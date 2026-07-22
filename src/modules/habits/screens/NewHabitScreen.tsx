import { useRouter } from "expo-router";
import { Text } from "react-native";

import { HabitForm } from "@/modules/habits/components/HabitForm";
import { useCreateHabit } from "@/modules/habits/data/useHabits";

export function NewHabitScreen() {
  const router = useRouter();
  const createHabit = useCreateHabit();

  return (
    <>
      <Text className="text-lg font-semibold text-foreground text-center mb-4">New habit</Text>
      <HabitForm
        submitLabel="Create habit"
        isSubmitting={createHabit.isPending}
        defaultValues={{
          name: "",
          description: "",
          cadence: "daily",
          target_per_period: 1,
          color: "#6366f1",
        }}
        onSubmit={(values) => {
          createHabit.mutate(
            { ...values, description: values.description || null },
            { onSuccess: () => router.back() }
          );
        }}
      />
    </>
  );
}
