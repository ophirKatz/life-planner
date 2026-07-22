import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { z } from "zod";

import { MiniMonthCalendar } from "@/modules/calendar/components/MiniMonthCalendar";
import type { RepeatOption } from "@/modules/calendar/types";
import { Button } from "@/core/ui/Button";
import { Input } from "@/core/ui/Input";
import { cn } from "@/core/ui/lib/utils";
import { TimeSelect } from "@/core/ui/TimeSelect";

const REPEAT_OPTIONS: { value: RepeatOption; label: string }[] = [
  { value: "none", label: "Never" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const COLORS = ["#6366f1", "#f59e0b", "#22c55e", "#ec4899", "#0ea5e9", "#ef4444"];

export const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  location: z.string().optional(),
  description: z.string().optional(),
  allDay: z.boolean(),
  date: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  repeat: z.enum(["none", "daily", "weekly", "monthly", "yearly"]),
  color: z.string(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

export interface EventFormProps {
  defaultValues: EventFormValues;
  onSubmit: (values: EventFormValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

export function EventForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: EventFormProps) {
  const [visibleMonth, setVisibleMonth] = useState(defaultValues.date);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({ resolver: zodResolver(eventFormSchema), defaultValues });

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="title"
        render={({ field }) => (
          <Input
            label="Title"
            value={field.value}
            onChangeText={field.onChange}
            error={errors.title?.message}
            autoFocus
          />
        )}
      />

      <Controller
        control={control}
        name="location"
        render={({ field }) => (
          <Input label="Location" value={field.value ?? ""} onChangeText={field.onChange} />
        )}
      />

      <Controller
        control={control}
        name="allDay"
        render={({ field }) => (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Duration</Text>
            <View className="flex-row gap-2">
              <Button
                label="Timed"
                size="sm"
                variant={!field.value ? "default" : "secondary"}
                className="flex-1"
                onPress={() => field.onChange(false)}
              />
              <Button
                label="All day"
                size="sm"
                variant={field.value ? "default" : "secondary"}
                className="flex-1"
                onPress={() => field.onChange(true)}
              />
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="date"
        render={({ field }) => (
          <MiniMonthCalendar
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            selectedDate={field.value}
            onSelectDate={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="allDay"
        render={({ field: allDayField }) =>
          allDayField.value ? (
            <View />
          ) : (
            <View className="flex-row gap-3">
              <Controller
                control={control}
                name="startTime"
                render={({ field }) => (
                  <View className="flex-1 gap-1.5">
                    <Text className="text-sm font-medium text-foreground">Starts</Text>
                    <TimeSelect value={field.value} onChange={field.onChange} />
                  </View>
                )}
              />
              <Controller
                control={control}
                name="endTime"
                render={({ field }) => (
                  <View className="flex-1 gap-1.5">
                    <Text className="text-sm font-medium text-foreground">Ends</Text>
                    <TimeSelect value={field.value} onChange={field.onChange} />
                  </View>
                )}
              />
            </View>
          )
        }
      />

      <Controller
        control={control}
        name="repeat"
        render={({ field }) => (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Repeats</Text>
            <View className="flex-row flex-wrap gap-2">
              {REPEAT_OPTIONS.map((option) => (
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
        name="description"
        render={({ field }) => (
          <Input
            label="Description"
            value={field.value ?? ""}
            onChangeText={field.onChange}
            multiline
            numberOfLines={3}
          />
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

      <Button label={submitLabel} onPress={handleSubmit(onSubmit)} isLoading={isSubmitting} className="mt-2" />
    </View>
  );
}
