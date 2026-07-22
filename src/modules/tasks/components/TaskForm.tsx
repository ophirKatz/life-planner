import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format, formatISO, isSameDay, setHours, setMinutes, startOfDay } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { z } from "zod";

import { useTaskLists } from "@/modules/tasks/data/useTaskLists";
import { Button } from "@/core/ui/Button";
import { Input } from "@/core/ui/Input";
import { OptionButtonGroup } from "@/core/ui/OptionButtonGroup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/Select";
import { TimeSelect } from "@/core/ui/TimeSelect";

const priorityLabels = ["None", "Low", "Medium", "High"];

// A due_at at exactly midnight means "due this day, no specific time" —
// there's no separate has-time flag in the tasks table.
function timeOfDay(iso: string): string {
  return format(new Date(iso), "HH:mm");
}

function hasTime(iso: string): boolean {
  return timeOfDay(iso) !== "00:00";
}

function withTime(dateIso: string, time: string): string {
  const [hours, minutes] = time.split(":").map(Number) as [number, number];
  return formatISO(setMinutes(setHours(new Date(dateIso), hours), minutes));
}

/** Switches the date to `dayIso` while preserving the current time-of-day, if any. */
function withDay(currentIso: string | null, dayIso: string): string {
  if (!currentIso || !hasTime(currentIso)) return dayIso;
  return withTime(dayIso, timeOfDay(currentIso));
}

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
  priority: z.number().min(0).max(3),
  due_at: z.string().nullable(),
  list_id: z.string().nullable(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export interface TaskFormProps {
  defaultValues: TaskFormValues;
  onSubmit: (values: TaskFormValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

export function TaskForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: TaskFormProps) {
  const { data: lists } = useTaskLists();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({ resolver: zodResolver(taskFormSchema), defaultValues });

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
        name="notes"
        render={({ field }) => (
          <Input
            label="Notes"
            value={field.value ?? ""}
            onChangeText={field.onChange}
            multiline
            numberOfLines={3}
          />
        )}
      />

      <Controller
        control={control}
        name="priority"
        render={({ field }) => (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Priority</Text>
            <OptionButtonGroup
              options={priorityLabels.map((label, value) => ({ value, label }))}
              value={field.value}
              onChange={field.onChange}
              equalWidth
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="due_at"
        render={({ field }) => {
          const today = formatISO(startOfDay(new Date()));
          const tomorrow = formatISO(startOfDay(addDays(new Date(), 1)));
          const isToday = !!field.value && isSameDay(new Date(field.value), new Date(today));
          const isTomorrow = !!field.value && isSameDay(new Date(field.value), new Date(tomorrow));
          const timed = !!field.value && hasTime(field.value);

          const dueChoice = isToday ? "today" : isTomorrow ? "tomorrow" : !field.value ? "none" : "custom";

          return (
            <View className="gap-3">
              <View className="gap-1.5">
                <Text className="text-sm font-medium text-foreground">Due</Text>
                <OptionButtonGroup
                  options={[
                    { value: "today", label: "Today" },
                    { value: "tomorrow", label: "Tomorrow" },
                    { value: "none", label: "None" },
                  ]}
                  value={dueChoice}
                  onChange={(choice) => {
                    if (choice === "today") field.onChange(withDay(field.value, today));
                    else if (choice === "tomorrow") field.onChange(withDay(field.value, tomorrow));
                    else field.onChange(null);
                  }}
                  equalWidth
                />
              </View>

              {field.value ? (
                <View className="gap-1.5">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-foreground">Time</Text>
                    {timed ? (
                      <Pressable
                        hitSlop={8}
                        onPress={() => field.onChange(formatISO(startOfDay(new Date(field.value!))))}
                      >
                        <Text className="text-xs text-muted-foreground">No specific time</Text>
                      </Pressable>
                    ) : null}
                  </View>
                  <TimeSelect
                    value={timed ? timeOfDay(field.value) : ""}
                    onChange={(time) => field.onChange(withTime(field.value!, time))}
                  />
                </View>
              ) : null}
            </View>
          );
        }}
      />

      {lists && lists.length > 0 ? (
        <Controller
          control={control}
          name="list_id"
          render={({ field }) => {
            const selected = lists.find((l) => l.id === field.value);
            return (
              <View className="gap-1.5">
                <Text className="text-sm font-medium text-foreground">List</Text>
                <Select
                  value={selected ? { value: selected.id, label: selected.name } : undefined}
                  onValueChange={(option) => field.onChange(option?.value ?? null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No list" />
                  </SelectTrigger>
                  <SelectContent>
                    {lists.map((list) => (
                      <SelectItem key={list.id} label={list.name} value={list.id} />
                    ))}
                  </SelectContent>
                </Select>
              </View>
            );
          }}
        />
      ) : null}

      <Button
        label={submitLabel}
        onPress={handleSubmit(onSubmit)}
        isLoading={isSubmitting}
        className="mt-2"
      />
    </View>
  );
}
