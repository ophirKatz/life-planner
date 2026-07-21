import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { HabitInsert, HabitRow, HabitUpdate } from "@/modules/habits/types";

export const habitsKey = ["habits"] as const;
export const habitKey = (id: string) => ["habits", id] as const;

export function useHabits() {
  return useQuery({
    queryKey: habitsKey,
    queryFn: async (): Promise<HabitRow[]> => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .is("archived_at", null)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useHabit(id: string) {
  return useQuery({
    queryKey: habitKey(id),
    queryFn: async (): Promise<HabitRow> => {
      const { data, error } = await supabase.from("habits").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<HabitInsert, "user_id">): Promise<HabitRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("habits")
        .insert({ ...input, user_id: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: habitsKey }),
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: HabitUpdate }): Promise<HabitRow> => {
      const { data, error } = await supabase.from("habits").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: habitsKey });
      queryClient.invalidateQueries({ queryKey: habitKey(data.id) });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: habitsKey }),
  });
}
