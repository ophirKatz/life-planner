import { endOfDay, set, startOfDay } from "date-fns";
import { useRouter } from "expo-router";
import { AlertTriangle } from "lucide-react-native";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EventForm, type EventFormValues } from "@/modules/calendar/components/EventForm";
import {
  useCalendarEvent,
  useDeleteCalendarEvent,
  useUpdateCalendarEvent,
} from "@/modules/calendar/data/useCalendarEvents";
import { REPEAT_TO_RRULE, rruleToRepeatOption } from "@/modules/calendar/types";
import { LinkedItemsSection } from "@/core/links/LinkedItemsSection";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";

export function EventDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: event, isLoading, isError } = useCalendarEvent(id);
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (isError || !event) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
        <EmptyState icon={AlertTriangle} title="Event not found" />
      </SafeAreaView>
    );
  }

  const startsAt = new Date(event.starts_at);
  const endsAt = new Date(event.ends_at);

  const defaultValues: EventFormValues = {
    title: event.title,
    location: event.location ?? "",
    description: event.description ?? "",
    allDay: event.all_day,
    date: startsAt,
    startTime: `${String(startsAt.getHours()).padStart(2, "0")}:${startsAt.getMinutes() < 30 ? "00" : "30"}`,
    endTime: `${String(endsAt.getHours()).padStart(2, "0")}:${endsAt.getMinutes() < 30 ? "00" : "30"}`,
    repeat: rruleToRepeatOption(event.rrule),
    color: event.color,
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-10 gap-6">
        <View>
          <EventForm
            submitLabel="Save changes"
            isSubmitting={updateEvent.isPending}
            defaultValues={defaultValues}
            onSubmit={(values) => {
              const [startHour, startMinute] = values.startTime.split(":").map(Number);
              const [endHour, endMinute] = values.endTime.split(":").map(Number);
              const startsAtNext = values.allDay
                ? startOfDay(values.date)
                : set(values.date, { hours: startHour, minutes: startMinute, seconds: 0 });
              const endsAtNext = values.allDay
                ? endOfDay(values.date)
                : set(values.date, { hours: endHour, minutes: endMinute, seconds: 0 });

              updateEvent.mutate({
                id: event.id,
                patch: {
                  title: values.title,
                  location: values.location || null,
                  description: values.description || null,
                  all_day: values.allDay,
                  starts_at: startsAtNext.toISOString(),
                  ends_at: (endsAtNext < startsAtNext ? startsAtNext : endsAtNext).toISOString(),
                  rrule: values.repeat === "none" ? null : REPEAT_TO_RRULE[values.repeat],
                  color: values.color,
                },
              });
            }}
          />
        </View>

        <LinkedItemsSection entityType="calendar_event" entityId={event.id} />

        <Button
          label="Delete event"
          variant="destructive"
          isLoading={deleteEvent.isPending}
          onPress={() => deleteEvent.mutate(event.id, { onSuccess: () => router.back() })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
