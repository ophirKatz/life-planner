import { Stack } from "expo-router";

import { NewRecipeScreen } from "@/modules/recipes/screens/NewRecipeScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "New Recipe", presentation: "modal" }} />
      <NewRecipeScreen />
    </>
  );
}
