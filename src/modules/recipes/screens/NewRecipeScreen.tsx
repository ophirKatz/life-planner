import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-10">
        <View className="mb-6">
          <Text className="text-2xl font-semibold text-foreground">New recipe</Text>
        </View>
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
      </ScrollView>
    </SafeAreaView>
  );
}
