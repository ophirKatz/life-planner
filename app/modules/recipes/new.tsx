import { Stack } from "expo-router";

import { NewRecipeScreen } from "@/modules/recipes/screens/NewRecipeScreen";
import { RouteSheet } from "@/core/ui/RouteSheet";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "transparentModal", animation: "none" }} />
      <RouteSheet>
        <NewRecipeScreen />
      </RouteSheet>
    </>
  );
}
