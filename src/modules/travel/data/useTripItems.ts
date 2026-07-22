import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { TripItemRow, TripItemType } from "@/modules/travel/types";

export const tripItemsKey = (tripId: string, type: TripItemType) => ["trips", tripId, "items", type] as const;

export function useTripItems(tripId: string, type: TripItemType) {
  return useQuery({
    queryKey: tripItemsKey(tripId, type),
    queryFn: async (): Promise<TripItemRow[]> => {
      const { data, error } = await supabase
        .from("trip_items")
        .select("*")
        .eq("trip_id", tripId)
        .eq("type", type)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!tripId,
  });
}

export function useCreateTripItem(tripId: string, type: TripItemType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; details?: string | null }): Promise<TripItemRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("trip_items")
        .insert({ ...input, trip_id: tripId, type, user_id: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tripItemsKey(tripId, type) }),
  });
}

export function useToggleTripItemDone(tripId: string, type: TripItemType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: TripItemRow): Promise<void> => {
      const { error } = await supabase.from("trip_items").update({ done: !item.done }).eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tripItemsKey(tripId, type) }),
  });
}

export function useDeleteTripItem(tripId: string, type: TripItemType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("trip_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tripItemsKey(tripId, type) }),
  });
}
