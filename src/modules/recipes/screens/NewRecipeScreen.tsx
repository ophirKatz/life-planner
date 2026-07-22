import { useRouter } from "expo-router";
import { Text } from "react-native";

import { RecipeForm } from "@/modules/recipes/components/RecipeForm";
import { useCreateRecipe } from "@/modules/recipes/data/useRecipes";

function parseLines(input?: string): string[] {
  return (input ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseTags(input?: string): string[] {
  return (input ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function NewRecipeScreen() {
  const router = useRouter();
  const createRecipe = useCreateRecipe();

  return (
    <>
      <Text className="text-lg font-semibold text-foreground text-center mb-4">New recipe</Text>
      <RecipeForm
        submitLabel="Save recipe"
        isSubmitting={createRecipe.isPending}
        defaultValues={{ title: "", servings: 4, ingredients: "", instructions: "", tags: "", source_url: "" }}
        onSubmit={(values) => {
          createRecipe.mutate(
            {
              title: values.title,
              servings: values.servings,
              ingredients: parseLines(values.ingredients),
              instructions: values.instructions || null,
              tags: parseTags(values.tags),
              source_url: values.source_url || null,
            },
            { onSuccess: () => router.back() }
          );
        }}
      />
    </>
  );
}
