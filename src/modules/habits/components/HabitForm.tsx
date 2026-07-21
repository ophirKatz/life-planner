import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { z } from "zod";

import { Button } from "@/core/ui/Button";
import { Input } from "@/core/ui/Input";
import { cn } from "@/core/ui/lib/utils";

const CADENCES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "custom", label: "Custom" },
] as const;

const COLORS = ["#6366f1", "#f59e0b", "#22c55e", "#ec4899", "#0ea5e9", "#ef4444"];

export const habitFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  cadence: z.enum(["daily", "weekly", "custom"]),
  target_per_period: z.number().min(1).max(20),
  color: z.string(),
});

export type HabitFormValues = z.infer<typeof habitFormSchema>;

export interface HabitFormProps {
  defaultValues: HabitFormValues;
  onSubmit: (values: HabitFormValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

export function HabitForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: HabitFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HabitFormValues>({ resolver: zodResolver(habitFormSchema), defaultValues });

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Input
            label="Name"
            value={field.value}
            onChangeText={field.onChange}
            error={errors.name?.message}
            autoFocus
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <Input label="Description" value={field.value ?? ""} onChangeText={field.onChange} />
        )}
      />

      <Controller
        control={control}
        name="cadence"
        render={({ field }) => (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Cadence</Text>
            <View className="flex-row gap-2">
              {CADENCES.map((c) => (
                <Button
                  key={c.value}
                  label={c.label}
                  size="sm"
                  variant={field.value === c.value ? "default" : "secondary"}
                  className="flex-1"
                  onPress={() => field.onChange(c.value)}
                />
              ))}
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="target_per_period"
        render={({ field }) => (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Target per period</Text>
            <View className="flex-row items-center gap-4">
              <Button
                size="icon"
                variant="secondary"
                label="-"
                onPress={() => field.onChange(Math.max(1, field.value - 1))}
              />
              <Text className="text-lg font-semibold text-foreground tabular-nums w-6 text-center">
                {field.value}
              </Text>
              <Button
                size="icon"
                variant="secondary"
                label="+"
                onPress={() => field.onChange(Math.min(20, field.value + 1))}
              />
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="color"
        render={({ field }) => (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Color</Text>
            <View className="flex-row gap-3">
              {COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => field.onChange(color)}
                  className={cn(
                    "h-9 w-9 rounded-full items-center justify-center",
                    field.value === color && "border-2 border-foreground"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </View>
          </View>
        )}
      />

      <Button
        label={submitLabel}
        onPress={handleSubmit(onSubmit)}
        isLoading={isSubmitting}
        className="mt-2"
      />
    </View>
  );
}
