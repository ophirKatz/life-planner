import { useRouter } from "expo-router";
import { Lightbulb } from "lucide-react-native";
import { Text, View } from "react-native";

import { useIdeas } from "@/modules/ideas/data/useIdeas";
import { CardTitle, PressableCard } from "@/core/ui/Card";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export function IdeasWidget() {
  const router = useRouter();
  const { data: ideas, isLoading } = useIdeas();
  const colors = useThemeColors();

  const active = (ideas ?? []).filter((idea) => idea.status === "new" || idea.status === "exploring");
  const recent = active.slice(0, 3);

  return (
    <PressableCard onPress={() => router.push("/modules/ideas")}>
      <View className="flex-row items-center gap-2 mb-3">
        <Lightbulb size={18} color={colors.accent} />
        <CardTitle>Idea Log</CardTitle>
      </View>

      {isLoading ? (
        <View className="gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </View>
      ) : active.length === 0 ? (
        <Text className="text-sm text-muted-foreground">No open ideas.</Text>
      ) : (
        <View className="gap-1.5">
          {recent.map((idea) => (
            <Text key={idea.id} className="text-sm text-foreground" numberOfLines={1}>
              • {idea.title}
            </Text>
          ))}
          {active.length > recent.length ? (
            <Text className="text-sm text-muted-foreground mt-1">+{active.length - recent.length} more</Text>
          ) : null}
        </View>
      )}
    </PressableCard>
  );
}
