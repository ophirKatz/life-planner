import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";

import { Button } from "@/core/ui/Button";
import { Input } from "@/core/ui/Input";
import { NumberStepper } from "@/core/ui/NumberStepper";

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
          <NumberStepper label="Servings" value={field.value} onChange={field.onChange} min={1} max={50} />
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
