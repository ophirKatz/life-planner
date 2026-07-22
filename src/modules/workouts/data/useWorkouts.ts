import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { WorkoutInsert, WorkoutRow, WorkoutUpdate } from "@/modules/workouts/types";

export const workoutsKey = ["workouts"] as const;
export const workoutKey = (id: string) => ["workouts", id] as const;

export function useWorkouts() {
  return useQuery({
    queryKey: workoutsKey,
    queryFn: async (): Promise<WorkoutRow[]> => {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .order("workout_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useWorkout(id: string) {
  return useQuery({
    queryKey: workoutKey(id),
    queryFn: async (): Promise<WorkoutRow> => {
      const { data, error } = await supabase.from("workouts").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<WorkoutInsert, "user_id">): Promise<WorkoutRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("workouts")
        .insert({ ...input, user_id: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workoutsKey }),
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: WorkoutUpdate }): Promise<WorkoutRow> => {
      const { data, error } = await supabase.from("workouts").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workoutsKey });
      queryClient.invalidateQueries({ queryKey: workoutKey(data.id) });
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("workouts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workoutsKey }),
  });
}
