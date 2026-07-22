import { useRouter } from "expo-router";
import { Text } from "react-native";

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
    <>
      <Text className="text-lg font-semibold text-foreground text-center mb-4">Log a workout</Text>
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
    </>
  );
}
