import { useRouter } from "expo-router";
import { AlertTriangle } from "lucide-react-native";
import { ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RecipeForm } from "@/modules/recipes/components/RecipeForm";
import { useDeleteRecipe, useRecipe, useUpdateRecipe } from "@/modules/recipes/data/useRecipes";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";

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

export function RecipeDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: recipe, isLoading, isError } = useRecipe(id);
  const updateRecipe = useUpdateRecipe();
  const deleteRecipe = useDeleteRecipe();

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (isError || !recipe) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
        <EmptyState icon={AlertTriangle} title="Recipe not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-10 gap-6">
        <RecipeForm
          submitLabel="Save changes"
          isSubmitting={updateRecipe.isPending}
          defaultValues={{
            title: recipe.title,
            servings: recipe.servings,
            ingredients: recipe.ingredients.join("\n"),
            instructions: recipe.instructions ?? "",
            tags: recipe.tags.join(", "),
            source_url: recipe.source_url ?? "",
          }}
          onSubmit={(values) => {
            updateRecipe.mutate({
              id: recipe.id,
              patch: {
                title: values.title,
                servings: values.servings,
                ingredients: parseLines(values.ingredients),
                instructions: values.instructions || null,
                tags: parseTags(values.tags),
                source_url: values.source_url || null,
              },
            });
          }}
        />

        <Button
          label="Delete recipe"
          variant="destructive"
          isLoading={deleteRecipe.isPending}
          onPress={() => deleteRecipe.mutate(recipe.id, { onSuccess: () => router.back() })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
