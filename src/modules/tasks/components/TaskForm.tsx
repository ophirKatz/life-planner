import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, formatISO, startOfDay } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { z } from "zod";

import { useTaskLists } from "@/modules/tasks/data/useTaskLists";
import { Button } from "@/core/ui/Button";
import { Input } from "@/core/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/Select";

const priorityLabels = ["None", "Low", "Medium", "High"];

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
            <View className="flex-row gap-2">
              {priorityLabels.map((label, value) => (
                <Button
                  key={label}
                  label={label}
                  size="sm"
                  variant={field.value === value ? "default" : "secondary"}
                  className="flex-1"
                  onPress={() => field.onChange(value)}
                />
              ))}
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="due_at"
        render={({ field }) => {
          const today = formatISO(startOfDay(new Date()));
          const tomorrow = formatISO(startOfDay(addDays(new Date(), 1)));
          return (
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">Due</Text>
              <View className="flex-row gap-2">
                <Button
                  label="Today"
                  size="sm"
                  variant={field.value === today ? "default" : "secondary"}
                  className="flex-1"
                  onPress={() => field.onChange(today)}
                />
                <Button
                  label="Tomorrow"
                  size="sm"
                  variant={field.value === tomorrow ? "default" : "secondary"}
                  className="flex-1"
                  onPress={() => field.onChange(tomorrow)}
                />
                <Button
                  label="None"
                  size="sm"
                  variant={!field.value ? "default" : "secondary"}
                  className="flex-1"
                  onPress={() => field.onChange(null)}
                />
              </View>
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
