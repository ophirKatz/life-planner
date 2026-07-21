import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, subDays } from "date-fns";

import { supabase } from "@/core/db/supabase";
import { habitsKey } from "@/modules/habits/data/useHabits";
import { todayKey } from "@/modules/habits/streaks";
import type { HabitLogRow } from "@/modules/habits/types";

export const habitLogsKey = (habitId: string) => ["habits", habitId, "logs"] as const;

/** Enough history for the streak calc (and a simple recent-activity view). */
export function useHabitLogs(habitId: string) {
  return useQuery({
    queryKey: habitLogsKey(habitId),
    queryFn: async (): Promise<HabitLogRow[]> => {
      const since = format(subDays(new Date(), 90), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("habit_id", habitId)
        .gte("date", since)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!habitId,
  });
}

/** Toggles today's check-in: inserts a log if missing, deletes it if present. */
export function useToggleHabitToday(habitId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (isCheckedToday: boolean): Promise<void> => {
      const date = todayKey();
      if (isCheckedToday) {
        const { error } = await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", habitId)
          .eq("date", date);
        if (error) throw error;
        return;
      }

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { error } = await supabase
        .from("habit_logs")
        .insert({ habit_id: habitId, user_id: auth.user.id, date });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitLogsKey(habitId) });
      queryClient.invalidateQueries({ queryKey: habitsKey });
    },
  });
}
