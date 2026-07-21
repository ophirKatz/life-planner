import { useRouter } from "expo-router";
import { ShoppingCart } from "lucide-react-native";
import { Text, View } from "react-native";

import { useShoppingLists } from "@/modules/shopping/data/useShoppingLists";
import { CardTitle, PressableCard } from "@/core/ui/Card";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export function ShoppingWidget() {
  const router = useRouter();
  const { data: lists, isLoading } = useShoppingLists();
  const colors = useThemeColors();

  return (
    <PressableCard onPress={() => router.push("/modules/shopping")}>
      <View className="flex-row items-center gap-2 mb-3">
        <ShoppingCart size={18} color={colors.accent} />
        <CardTitle>Shopping</CardTitle>
      </View>

      {isLoading ? (
        <Skeleton className="h-4 w-2/3" />
      ) : !lists || lists.length === 0 ? (
        <Text className="text-sm text-muted-foreground">No lists yet.</Text>
      ) : (
        <Text className="text-sm text-foreground">
          {lists.length} list{lists.length === 1 ? "" : "s"}
        </Text>
      )}
    </PressableCard>
  );
}
