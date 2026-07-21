import { addDays, format } from "date-fns";
import { useRouter } from "expo-router";
import { Calendar } from "lucide-react-native";
import { Text, View } from "react-native";

import { useCalendarEvents } from "@/modules/calendar/data/useCalendarEvents";
import { CardTitle, PressableCard } from "@/core/ui/Card";
import { Skeleton } from "@/core/ui/Skeleton";

export function CalendarWidget() {
  const router = useRouter();
  const now = new Date();
  const { data: events, isLoading } = useCalendarEvents(now, addDays(now, 14));

  const upcoming = (events ?? []).slice(0, 3);

  return (
    <PressableCard onPress={() => router.push("/(tabs)/calendar")}>
      <View className="flex-row items-center gap-2 mb-3">
        <Calendar size={18} color="#6366f1" />
        <CardTitle>Calendar</CardTitle>
      </View>

      {isLoading ? (
        <Skeleton className="h-4 w-2/3" />
      ) : upcoming.length === 0 ? (
        <Text className="text-sm text-muted-foreground">Nothing coming up.</Text>
      ) : (
        <View className="gap-1.5">
          {upcoming.map((event) => (
            <Text key={event.id} className="text-sm text-foreground" numberOfLines={1}>
              {format(new Date(event.starts_at), "EEE d")} · {event.title}
            </Text>
          ))}
        </View>
      )}
    </PressableCard>
  );
}
