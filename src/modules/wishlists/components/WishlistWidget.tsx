import { useRouter } from "expo-router";
import { Bookmark } from "lucide-react-native";
import { Text, View } from "react-native";

import { useWishlistItems } from "@/modules/wishlists/data/useWishlistItems";
import { CardTitle, PressableCard } from "@/core/ui/Card";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export function WishlistWidget() {
  const router = useRouter();
  const { data: items, isLoading } = useWishlistItems();
  const colors = useThemeColors();

  const queued = (items ?? []).filter((item) => item.status !== "done");
  const recent = queued.slice(0, 3);

  return (
    <PressableCard onPress={() => router.push("/modules/wishlists")}>
      <View className="flex-row items-center gap-2 mb-3">
        <Bookmark size={18} color={colors.accent} />
        <CardTitle>Wishlist</CardTitle>
      </View>

      {isLoading ? (
        <View className="gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </View>
      ) : queued.length === 0 ? (
        <Text className="text-sm text-muted-foreground">Nothing queued.</Text>
      ) : (
        <View className="gap-1.5">
          {recent.map((item) => (
            <Text key={item.id} className="text-sm text-foreground" numberOfLines={1}>
              • {item.title}
            </Text>
          ))}
          {queued.length > recent.length ? (
            <Text className="text-sm text-muted-foreground mt-1">+{queued.length - recent.length} more</Text>
          ) : null}
        </View>
      )}
    </PressableCard>
  );
}
