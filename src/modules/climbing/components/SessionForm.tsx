import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";

import { Button } from "@/core/ui/Button";
import { Input } from "@/core/ui/Input";

export const sessionFormSchema = z.object({
  location: z.string().optional(),
  duration_minutes: z.number().min(0).max(600).optional(),
  notes: z.string().optional(),
});

export type SessionFormValues = z.infer<typeof sessionFormSchema>;

export interface SessionFormProps {
  defaultValues: SessionFormValues;
  onSubmit: (values: SessionFormValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

export function SessionForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: SessionFormProps) {
  const { control, handleSubmit } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues,
  });

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="location"
        render={({ field }) => (
          <Input label="Gym / location" value={field.value ?? ""} onChangeText={field.onChange} autoFocus />
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
        name="notes"
        render={({ field }) => (
          <Input label="Notes" value={field.value ?? ""} onChangeText={field.onChange} multiline numberOfLines={3} />
        )}
      />

      <Button label={submitLabel} onPress={handleSubmit(onSubmit)} isLoading={isSubmitting} className="mt-2" />
    </View>
  );
}
