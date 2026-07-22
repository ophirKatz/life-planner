import { Stack, useLocalSearchParams } from "expo-router";

import { RecipeDetailScreen } from "@/modules/recipes/screens/RecipeDetailScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "Recipe" }} />
      <RecipeDetailScreen id={id} />
    </>
  );
}
