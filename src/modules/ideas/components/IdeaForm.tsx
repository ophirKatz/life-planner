import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { z } from "zod";

import type { IdeaStatus } from "@/modules/ideas/types";
import { Button } from "@/core/ui/Button";
import { Input } from "@/core/ui/Input";

const STATUS_OPTIONS: { value: IdeaStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "exploring", label: "Exploring" },
  { value: "done", label: "Done" },
  { value: "archived", label: "Archived" },
];

export const ideaFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["new", "exploring", "archived", "done"]),
});

export type IdeaFormValues = z.infer<typeof ideaFormSchema>;

export interface IdeaFormProps {
  defaultValues: IdeaFormValues;
  onSubmit: (values: IdeaFormValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

export function IdeaForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: IdeaFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IdeaFormValues>({ resolver: zodResolver(ideaFormSchema), defaultValues });

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
        name="description"
        render={({ field }) => (
          <Input
            label="Description"
            value={field.value ?? ""}
            onChangeText={field.onChange}
            multiline
            numberOfLines={4}
          />
        )}
      />

      <Controller
        control={control}
        name="tags"
        render={({ field }) => (
          <Input
            label="Tags"
            placeholder="comma, separated, tags"
            value={field.value ?? ""}
            onChangeText={field.onChange}
            autoCapitalize="none"
          />
        )}
      />

      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Status</Text>
            <View className="flex-row flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
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

      <Button label={submitLabel} onPress={handleSubmit(onSubmit)} isLoading={isSubmitting} className="mt-2" />
    </View>
  );
}
