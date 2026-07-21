import { router } from "expo-router";
import { Calendar as CalendarIcon } from "lucide-react-native";

import { CalendarWidget } from "@/modules/calendar/components/CalendarWidget";
import { listAllCalendarEvents, resolveCalendarEvent } from "@/modules/calendar/linkable";
import type { ModuleDefinition } from "@/core/modules/types";

export const calendarModule: ModuleDefinition = {
  slug: "calendar",
  name: "Calendar",
  icon: CalendarIcon,
  tier: "free",
  // The Calendar tab (app/(tabs)/calendar.tsx) hosts the main screen directly
  // instead of the generic app/modules/[slug] push pattern the other modules
  // use — new/detail still go through app/modules/calendar/*.
  routes: [{ path: "calendar", title: "Calendar" }],
  dashboardWidgets: [CalendarWidget],
  quickAddActions: [
    {
      id: "calendar.new",
      label: "New event",
      icon: CalendarIcon,
      onPress: () => router.push("/modules/calendar/new"),
    },
  ],
  linkableEntities: [
    {
      type: "calendar_event",
      table: "calendar_events",
      label: "Event",
      resolve: resolveCalendarEvent,
      listAll: listAllCalendarEvents,
    },
  ],
};
