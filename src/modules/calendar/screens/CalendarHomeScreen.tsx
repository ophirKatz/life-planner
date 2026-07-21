import { endOfMonth, format, isSameDay, startOfMonth } from "date-fns";
import { useRouter } from "expo-router";
import { CalendarDays, Plus } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EventListRow } from "@/modules/calendar/components/EventListRow";
import { MiniMonthCalendar } from "@/modules/calendar/components/MiniMonthCalendar";
import { useCalendarEvents } from "@/modules/calendar/data/useCalendarEvents";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { Skeleton } from "@/core/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/ui/Tabs";

function MonthView() {
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: events, isLoading } = useCalendarEvents(startOfMonth(month), endOfMonth(month));

  const markedDates = useMemo(() => {
    const set = new Set<string>();
    (events ?? []).forEach((e) => set.add(format(new Date(e.starts_at), "yyyy-MM-dd")));
    return set;
  }, [events]);

  const dayEvents = (events ?? []).filter((e) => isSameDay(new Date(e.starts_at), selectedDate));

  return (
    <View className="flex-1 px-6 pt-4 gap-4">
      <MiniMonthCalendar
        month={month}
        onMonthChange={setMonth}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        markedDates={markedDates}
      />

      <View className="gap-2">
        <Text className="text-sm font-medium text-muted-foreground">
          {format(selectedDate, "EEEE, MMMM d")}
        </Text>
        {isLoading ? (
          <Skeleton className="h-14 w-full" />
        ) : dayEvents.length === 0 ? (
          <Text className="text-sm text-muted-foreground">No events.</Text>
        ) : (
          <View className="gap-2">
            {dayEvents.map((event) => (
              <EventListRow key={event.id} event={event} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function AgendaView() {
  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const { data: events, isLoading, isError, refetch } = useCalendarEvents(now, in90Days);

  if (isLoading) {
    return (
      <View className="px-6 pt-4 gap-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </View>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Couldn't load your events"
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  if (!events || events.length === 0) {
    return <EmptyState icon={CalendarDays} title="Nothing on the calendar" />;
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 24, gap: 8 }}
      renderItem={({ item }) => <EventListRow event={item} />}
    />
  );
}

export function CalendarHomeScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<"month" | "agenda">("month");

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-foreground">Calendar</Text>
        <Button size="icon" variant="secondary" onPress={() => router.push("/modules/calendar/new")}>
          <Plus size={20} color="#1c1e21" />
        </Button>
      </View>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as "month" | "agenda")}
        className="flex-1"
      >
        <View className="px-6">
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>
        </View>
        <TabsContent value="month" className="flex-1">
          <MonthView />
        </TabsContent>
        <TabsContent value="agenda" className="flex-1">
          <AgendaView />
        </TabsContent>
      </Tabs>
    </SafeAreaView>
  );
}
