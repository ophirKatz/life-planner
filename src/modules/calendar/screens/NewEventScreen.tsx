import { endOfDay, set, startOfDay } from "date-fns";
import { useRouter } from "expo-router";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EventForm, type EventFormValues } from "@/modules/calendar/components/EventForm";
import { useCreateCalendarEvent } from "@/modules/calendar/data/useCalendarEvents";
import { REPEAT_TO_RRULE } from "@/modules/calendar/types";

function buildEventPayload(values: EventFormValues) {
  const [startHour, startMinute] = values.startTime.split(":").map(Number);
  const [endHour, endMinute] = values.endTime.split(":").map(Number);

  const startsAt = values.allDay
    ? startOfDay(values.date)
    : set(values.date, { hours: startHour, minutes: startMinute, seconds: 0 });
  const endsAt = values.allDay
    ? endOfDay(values.date)
    : set(values.date, { hours: endHour, minutes: endMinute, seconds: 0 });

  return {
    title: values.title,
    location: values.location || null,
    description: values.description || null,
    all_day: values.allDay,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt < startsAt ? startsAt.toISOString() : endsAt.toISOString(),
    rrule: values.repeat === "none" ? null : REPEAT_TO_RRULE[values.repeat],
    color: values.color,
  };
}

export function NewEventScreen() {
  const router = useRouter();
  const createEvent = useCreateCalendarEvent();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-10">
        <Text className="text-2xl font-semibold text-foreground mb-6">New event</Text>
        <EventForm
          submitLabel="Create event"
          isSubmitting={createEvent.isPending}
          defaultValues={{
            title: "",
            location: "",
            description: "",
            allDay: false,
            date: new Date(),
            startTime: "09:00",
            endTime: "10:00",
            repeat: "none",
            color: "#6366f1",
          }}
          onSubmit={(values) => {
            createEvent.mutate(buildEventPayload(values), { onSuccess: () => router.back() });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
