import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { TripInsert, TripRow } from "@/modules/travel/types";

export const tripsKey = ["trips"] as const;
export const tripKey = (id: string) => ["trips", id] as const;

export function useTrips() {
  return useQuery({
    queryKey: tripsKey,
    queryFn: async (): Promise<TripRow[]> => {
      const { data, error } = await supabase.from("trips").select("*").order("start_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: tripKey(id),
    queryFn: async (): Promise<TripRow> => {
      const { data, error } = await supabase.from("trips").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<TripInsert, "user_id">): Promise<TripRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("trips")
        .insert({ ...input, user_id: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tripsKey }),
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("trips").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tripsKey }),
  });
}
