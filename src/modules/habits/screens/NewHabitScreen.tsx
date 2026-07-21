import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HabitForm } from "@/modules/habits/components/HabitForm";
import { useCreateHabit } from "@/modules/habits/data/useHabits";

export function NewHabitScreen() {
  const router = useRouter();
  const createHabit = useCreateHabit();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-6">
        <Text className="text-2xl font-semibold text-foreground mb-6">New habit</Text>
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
      </View>
    </SafeAreaView>
  );
}
