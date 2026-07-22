import { useRouter } from "expo-router";
import { AlertTriangle } from "lucide-react-native";
import { ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { WorkoutForm } from "@/modules/workouts/components/WorkoutForm";
import { useDeleteWorkout, useUpdateWorkout, useWorkout } from "@/modules/workouts/data/useWorkouts";
import type { WorkoutType } from "@/modules/workouts/types";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";

function parseLines(input?: string): string[] {
  return (input ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function WorkoutDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: workout, isLoading, isError } = useWorkout(id);
  const updateWorkout = useUpdateWorkout();
  const deleteWorkout = useDeleteWorkout();

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (isError || !workout) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
        <EmptyState icon={AlertTriangle} title="Workout not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-10 gap-6">
        <WorkoutForm
          submitLabel="Save changes"
          isSubmitting={updateWorkout.isPending}
          defaultValues={{
            type: workout.type as WorkoutType,
            duration_minutes: workout.duration_minutes ?? undefined,
            exercises: workout.exercises.join("\n"),
            notes: workout.notes ?? "",
          }}
          onSubmit={(values) => {
            updateWorkout.mutate({
              id: workout.id,
              patch: {
                type: values.type,
                duration_minutes: values.duration_minutes ?? null,
                exercises: parseLines(values.exercises),
                notes: values.notes || null,
              },
            });
          }}
        />

        <Button
          label="Delete workout"
          variant="destructive"
          isLoading={deleteWorkout.isPending}
          onPress={() => deleteWorkout.mutate(workout.id, { onSuccess: () => router.back() })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
