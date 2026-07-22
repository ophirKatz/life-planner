import { useRouter } from "expo-router";
import { Zap } from "lucide-react-native";
import { Text, View } from "react-native";

import { useFocusSummary } from "@/modules/focus/data/useFocusSummary";
import { CardTitle, PressableCard } from "@/core/ui/Card";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export function FocusWidget() {
  const router = useRouter();
  const { data: cached, isLoading } = useFocusSummary("tomorrow");
  const colors = useThemeColors();

  const payload = cached?.summary;
  const teaser =
    payload?.type === "text"
      ? payload.text
      : payload?.type === "cards"
        ? (payload.note ?? payload.cards[0]?.label)
        : null;

  return (
    <PressableCard onPress={() => router.push("/modules/focus")}>
      <View className="flex-row items-center gap-2 mb-3">
        <Zap size={18} color={colors.accent} />
        <CardTitle>Focus</CardTitle>
      </View>

      {isLoading ? (
        <Skeleton className="h-4 w-2/3" />
      ) : teaser ? (
        <Text className="text-sm text-foreground" numberOfLines={2}>
          {teaser}
        </Text>
      ) : (
        <Text className="text-sm text-muted-foreground">Tap to generate tomorrow&apos;s digest.</Text>
      )}
    </PressableCard>
  );
}
