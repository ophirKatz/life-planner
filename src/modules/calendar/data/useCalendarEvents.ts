import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type {
  CalendarEventInsert,
  CalendarEventRow,
  CalendarEventUpdate,
} from "@/modules/calendar/types";

export const calendarEventsKey = (startIso: string, endIso: string) =>
  ["calendar-events", startIso, endIso] as const;
export const calendarEventKey = (id: string) => ["calendar-events", "one", id] as const;

/** Events overlapping [start, end), used for both the month grid and agenda. */
export function useCalendarEvents(start: Date, end: Date) {
  const startIso = start.toISOString();
  const endIso = end.toISOString();

  return useQuery({
    queryKey: calendarEventsKey(startIso, endIso),
    queryFn: async (): Promise<CalendarEventRow[]> => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .lt("starts_at", endIso)
        .gt("ends_at", startIso)
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCalendarEvent(id: string) {
  return useQuery({
    queryKey: calendarEventKey(id),
    queryFn: async (): Promise<CalendarEventRow> => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<CalendarEventInsert, "user_id">): Promise<CalendarEventRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("calendar_events")
        .insert({ ...input, user_id: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar-events"] }),
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: CalendarEventUpdate;
    }): Promise<CalendarEventRow> => {
      const { data, error } = await supabase
        .from("calendar_events")
        .update(patch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar-events"] }),
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("calendar_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar-events"] }),
  });
}
