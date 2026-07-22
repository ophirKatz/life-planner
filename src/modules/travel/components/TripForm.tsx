import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, formatISO, startOfDay } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { z } from "zod";

import { Button } from "@/core/ui/Button";
import { Input } from "@/core/ui/Input";
import { cn } from "@/core/ui/lib/utils";

const COLORS = ["#6366f1", "#f59e0b", "#22c55e", "#ec4899", "#0ea5e9", "#ef4444"];

export const tripFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  destination: z.string().optional(),
  start_date: z.string(),
  end_date: z.string(),
  notes: z.string().optional(),
  color: z.string(),
});

export type TripFormValues = z.infer<typeof tripFormSchema>;

export interface TripFormProps {
  defaultValues: TripFormValues;
  onSubmit: (values: TripFormValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const options = [
    { label: "Today", days: 0 },
    { label: "+1 week", days: 7 },
    { label: "+1 month", days: 30 },
  ];

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-foreground">{label}</Text>
      <View className="flex-row gap-2">
        {options.map((option) => {
          const date = formatISO(addDays(startOfDay(new Date()), option.days), { representation: "date" });
          return (
            <Button
              key={option.label}
              label={option.label}
              size="sm"
              variant={value === date ? "default" : "secondary"}
              className="flex-1"
              onPress={() => onChange(date)}
            />
          );
        })}
      </View>
    </View>
  );
}

export function TripForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: TripFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TripFormValues>({ resolver: zodResolver(tripFormSchema), defaultValues });

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Input
            label="Trip name"
            value={field.value}
            onChangeText={field.onChange}
            error={errors.name?.message}
            autoFocus
          />
        )}
      />

      <Controller
        control={control}
        name="destination"
        render={({ field }) => (
          <Input label="Destination" value={field.value ?? ""} onChangeText={field.onChange} />
        )}
      />

      <Controller control={control} name="start_date" render={({ field }) => (
        <DateField label="Starts" value={field.value} onChange={field.onChange} />
      )} />

      <Controller control={control} name="end_date" render={({ field }) => (
        <DateField label="Ends" value={field.value} onChange={field.onChange} />
      )} />

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
