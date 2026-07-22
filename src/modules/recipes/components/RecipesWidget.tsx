import { useRouter } from "expo-router";
import { ChefHat } from "lucide-react-native";
import { Text, View } from "react-native";

import { useRecipes } from "@/modules/recipes/data/useRecipes";
import { CardTitle, PressableCard } from "@/core/ui/Card";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export function RecipesWidget() {
  const router = useRouter();
  const { data: recipes, isLoading } = useRecipes();
  const colors = useThemeColors();

  return (
    <PressableCard onPress={() => router.push("/modules/recipes")}>
      <View className="flex-row items-center gap-2 mb-3">
        <ChefHat size={18} color={colors.accent} />
        <CardTitle>Recipes</CardTitle>
      </View>

      {isLoading ? (
        <Skeleton className="h-4 w-2/3" />
      ) : !recipes || recipes.length === 0 ? (
        <Text className="text-sm text-muted-foreground">No recipes saved yet.</Text>
      ) : (
        <Text className="text-sm text-foreground">
          {recipes.length} recipe{recipes.length === 1 ? "" : "s"}
        </Text>
      )}
    </PressableCard>
  );
}
