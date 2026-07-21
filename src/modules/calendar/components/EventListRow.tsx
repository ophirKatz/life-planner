import { format } from "date-fns";
import { useRouter } from "expo-router";
import { Repeat } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import type { CalendarEventRow } from "@/modules/calendar/types";

export function EventListRow({ event }: { event: CalendarEventRow }) {
  const router = useRouter();

  return (
    <Pressable
      className="flex-row items-center gap-3 rounded-2xl bg-surface border border-border px-4 py-3 active:opacity-70"
      onPress={() => router.push(`/modules/calendar/${event.id}`)}
    >
      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: event.color }} />
      <View className="flex-1">
        <Text className="text-base font-medium text-foreground" numberOfLines={1}>
          {event.title}
        </Text>
        <Text className="text-sm text-muted-foreground">
          {event.all_day ? "All day" : `${format(new Date(event.starts_at), "p")} – ${format(new Date(event.ends_at), "p")}`}
          {event.location ? ` · ${event.location}` : ""}
        </Text>
      </View>
      {event.rrule ? <Repeat size={16} color="hsl(220 9% 46%)" /> : null}
    </Pressable>
  );
}
