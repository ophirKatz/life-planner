import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { z } from "zod";

import { Button } from "@/core/ui/Button";
import { Input } from "@/core/ui/Input";

export const recipeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  servings: z.number().min(1).max(50),
  ingredients: z.string().optional(),
  instructions: z.string().optional(),
  tags: z.string().optional(),
  source_url: z.string().optional(),
});

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;

export interface RecipeFormProps {
  defaultValues: RecipeFormValues;
  onSubmit: (values: RecipeFormValues) => void;
  isSubmitting?: boolean;
  submitLabel: string;
}

export function RecipeForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: RecipeFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipeFormValues>({ resolver: zodResolver(recipeFormSchema), defaultValues });

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
        name="servings"
        render={({ field }) => (
          <View className="gap-1.5">
            <Text className="text-sm font-medium text-foreground">Servings</Text>
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
                onPress={() => field.onChange(Math.min(50, field.value + 1))}
              />
            </View>
          </View>
        )}
      />

      <Controller
        control={control}
        name="ingredients"
        render={({ field }) => (
          <Input
            label="Ingredients"
            placeholder={"One per line, e.g.\n2 cups flour\n1 tsp salt"}
            value={field.value ?? ""}
            onChangeText={field.onChange}
            multiline
            numberOfLines={6}
          />
        )}
      />

      <Controller
        control={control}
        name="instructions"
        render={({ field }) => (
          <Input
            label="Instructions"
            value={field.value ?? ""}
            onChangeText={field.onChange}
            multiline
            numberOfLines={6}
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
        name="source_url"
        render={({ field }) => (
          <Input
            label="Source link"
            value={field.value ?? ""}
            onChangeText={field.onChange}
            autoCapitalize="none"
            keyboardType="url"
          />
        )}
      />

      <Button label={submitLabel} onPress={handleSubmit(onSubmit)} isLoading={isSubmitting} className="mt-2" />
    </View>
  );
}
