import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { WorkoutForm } from "@/modules/workouts/components/WorkoutForm";
import { useCreateWorkout } from "@/modules/workouts/data/useWorkouts";

function parseLines(input?: string): string[] {
  return (input ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function NewWorkoutScreen() {
  const router = useRouter();
  const createWorkout = useCreateWorkout();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-6">
        <Text className="text-2xl font-semibold text-foreground mb-6">Log a workout</Text>
        <WorkoutForm
          submitLabel="Save workout"
          isSubmitting={createWorkout.isPending}
          defaultValues={{ type: "strength", duration_minutes: undefined, exercises: "", notes: "" }}
          onSubmit={(values) => {
            createWorkout.mutate(
              {
                type: values.type,
                duration_minutes: values.duration_minutes ?? null,
                exercises: parseLines(values.exercises),
                notes: values.notes || null,
              },
              { onSuccess: () => router.back() }
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}
