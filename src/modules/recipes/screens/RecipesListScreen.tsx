import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { ChefHat, Plus } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRecipes } from "@/modules/recipes/data/useRecipes";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { ListItem } from "@/core/ui/ListItem";
import { SkeletonListItem } from "@/core/ui/Skeleton";

export function RecipesListScreen() {
  const router = useRouter();
  const { data: recipes, isLoading, isError, refetch } = useRecipes();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-foreground">Recipes</Text>
        <Button size="icon" variant="secondary" onPress={() => router.push("/modules/recipes/new")}>
          <Plus size={20} />
        </Button>
      </View>

      {isLoading ? (
        <View className="px-6 gap-2 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonListItem key={i} />
          ))}
        </View>
      ) : isError ? (
        <EmptyState
          icon={ChefHat}
          title="Couldn&apos;t load your recipes"
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : !recipes || recipes.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="No recipes yet"
          description="Save your first recipe to build your collection."
          actionLabel="New recipe"
          onAction={() => router.push("/modules/recipes/new")}
        />
      ) : (
        <FlashList
          data={recipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item }) => (
            <ListItem
              title={item.title}
              subtitle={`Serves ${item.servings}${item.tags.length > 0 ? ` · ${item.tags.join(", ")}` : ""}`}
              icon={ChefHat}
              showChevron
              onPress={() => router.push(`/modules/recipes/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
