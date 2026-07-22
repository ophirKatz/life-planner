import { router } from "expo-router";
import { ChefHat } from "lucide-react-native";

import { RecipesWidget } from "@/modules/recipes/components/RecipesWidget";
import type { ModuleDefinition } from "@/core/modules/types";

export const recipesModule: ModuleDefinition = {
  slug: "recipes",
  name: "Recipes",
  icon: ChefHat,
  tier: "pro",
  routes: [{ path: "recipes", title: "Recipes" }],
  dashboardWidgets: [RecipesWidget],
  quickAddActions: [
    {
      id: "recipes.new",
      label: "New recipe",
      icon: ChefHat,
      onPress: () => router.push("/modules/recipes/new"),
    },
  ],
  linkableEntities: [],
};
