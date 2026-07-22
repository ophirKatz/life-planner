import { differenceInCalendarDays, format } from "date-fns";
import { useRouter } from "expo-router";
import { Plane } from "lucide-react-native";
import { Text, View } from "react-native";

import { useTrips } from "@/modules/travel/data/useTrips";
import { CardTitle, PressableCard } from "@/core/ui/Card";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export function TripsWidget() {
  const router = useRouter();
  const { data: trips, isLoading } = useTrips();
  const colors = useThemeColors();

  const today = format(new Date(), "yyyy-MM-dd");
  const upcoming = (trips ?? []).filter((t) => t.end_date >= today)[0];

  return (
    <PressableCard onPress={() => router.push("/modules/travel")}>
      <View className="flex-row items-center gap-2 mb-3">
        <Plane size={18} color={colors.accent} />
        <CardTitle>Travel</CardTitle>
      </View>

      {isLoading ? (
        <Skeleton className="h-4 w-2/3" />
      ) : !upcoming ? (
        <Text className="text-sm text-muted-foreground">No trips planned.</Text>
      ) : (
        <Text className="text-sm text-foreground" numberOfLines={1}>
          {upcoming.name}
          {upcoming.start_date > today
            ? ` in ${differenceInCalendarDays(new Date(upcoming.start_date), new Date())} days`
            : " · in progress"}
        </Text>
      )}
    </PressableCard>
  );
}
