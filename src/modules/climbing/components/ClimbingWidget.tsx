import { startOfWeek } from "date-fns";
import { useRouter } from "expo-router";
import { Mountain } from "lucide-react-native";
import { Text, View } from "react-native";

import { useLastSentAttempt } from "@/modules/climbing/data/useClimbingAttempts";
import { useClimbingSessions } from "@/modules/climbing/data/useClimbingSessions";
import { CardTitle, PressableCard } from "@/core/ui/Card";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export function ClimbingWidget() {
  const router = useRouter();
  const { data: sessions, isLoading } = useClimbingSessions();
  const { data: lastSent } = useLastSentAttempt();
  const colors = useThemeColors();

  const weekStart = startOfWeek(new Date());
  const thisWeek = (sessions ?? []).filter((s) => new Date(s.session_date) >= weekStart);

  return (
    <PressableCard onPress={() => router.push("/modules/climbing")}>
      <View className="flex-row items-center gap-2 mb-3">
        <Mountain size={18} color={colors.accent} />
        <CardTitle>Climbing</CardTitle>
      </View>

      {isLoading ? (
        <Skeleton className="h-4 w-2/3" />
      ) : (
        <View className="gap-1">
          <Text className="text-sm text-foreground">
            {thisWeek.length} session{thisWeek.length === 1 ? "" : "s"} this week
          </Text>
          {lastSent ? (
            <Text className="text-sm text-muted-foreground">Last sent: {lastSent.grade}</Text>
          ) : null}
        </View>
      )}
    </PressableCard>
  );
}
