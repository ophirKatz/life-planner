import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { ClimbingSessionInsert, ClimbingSessionRow } from "@/modules/climbing/types";

export const climbingSessionsKey = ["climbing-sessions"] as const;
export const climbingSessionKey = (id: string) => ["climbing-sessions", id] as const;

export function useClimbingSessions() {
  return useQuery({
    queryKey: climbingSessionsKey,
    queryFn: async (): Promise<ClimbingSessionRow[]> => {
      const { data, error } = await supabase
        .from("climbing_sessions")
        .select("*")
        .order("session_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useClimbingSession(id: string) {
  return useQuery({
    queryKey: climbingSessionKey(id),
    queryFn: async (): Promise<ClimbingSessionRow> => {
      const { data, error } = await supabase.from("climbing_sessions").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateClimbingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<ClimbingSessionInsert, "user_id">): Promise<ClimbingSessionRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("climbing_sessions")
        .insert({ ...input, user_id: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: climbingSessionsKey }),
  });
}

export function useDeleteClimbingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("climbing_sessions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: climbingSessionsKey }),
  });
}
