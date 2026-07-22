import { Stack } from "expo-router";

import { RecipesListScreen } from "@/modules/recipes/screens/RecipesListScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <RecipesListScreen />
    </>
  );
}
