import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { z } from "zod";

import type { WorkoutType } from "@/modules/workouts/types";
import { Button } from "@/core/ui/Button";
import { Input } from "@/core/ui/Input";

const TYPE_OPTIONS: { value: WorkoutType; label: string }[] = [
  { value: "strength", label: "Strength" },
  { value: "cardio", label: "Cardio" },
  { value: "yoga", label: "Yoga" },
  { value: "other", label: "Other" },
];

export const workoutFormSchema = z.object({
  type: z.enum(["strength", "cardio", "yoga", "other"]),
  duration_minutes: z.number().min(0).max(600).optional(),
  exercises: z.string().optional(),
  notes: z.string().optional(),
});

export type WorkoutFormValues = z.infer<typeof workoutFormSchema>;

export interface WorkoutFormProps {
  defaultValues: WorkoutFormValues;
  onSubmit: (values: WorkoutFormValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

export function WorkoutForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: WorkoutFormProps) {
  const { control, handleSubmit } = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues,
  });

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Type</Text>
            <View className="flex-row flex-wrap gap-2">
              {TYPE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  label={option.label}
                  size="sm"
                  variant={field.value === option.value ? "default" : "secondary"}
                  onPress={() => field.onChange(option.value)}
                />
              ))}
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="duration_minutes"
        render={({ field }) => (
          <Input
            label="Duration (minutes)"
            value={field.value ? String(field.value) : ""}
            onChangeText={(text) => field.onChange(text ? Number(text.replace(/[^0-9]/g, "")) : undefined)}
            keyboardType="number-pad"
          />
        )}
      />

      <Controller
        control={control}
        name="exercises"
        render={({ field }) => (
          <Input
            label="Exercises"
            placeholder={"One per line, e.g.\nBench press 3x8 @135lb\nRunning 5k"}
            value={field.value ?? ""}
            onChangeText={field.onChange}
            multiline
            numberOfLines={5}
          />
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field }) => (
          <Input label="Notes" value={field.value ?? ""} onChangeText={field.onChange} multiline numberOfLines={3} />
        )}
      />

      <Button label={submitLabel} onPress={handleSubmit(onSubmit)} isLoading={isSubmitting} className="mt-2" />
    </View>
  );
}
