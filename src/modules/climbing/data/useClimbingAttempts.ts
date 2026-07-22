import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { ClimbingAttemptRow, ClimbingStyle } from "@/modules/climbing/types";

export const climbingAttemptsKey = (sessionId: string) => ["climbing-sessions", sessionId, "attempts"] as const;
export const lastSentAttemptKey = ["climbing-attempts", "last-sent"] as const;

/** Most recent sent grade across every session — for the dashboard widget. */
export function useLastSentAttempt() {
  return useQuery({
    queryKey: lastSentAttemptKey,
    queryFn: async (): Promise<ClimbingAttemptRow | null> => {
      const { data, error } = await supabase
        .from("climbing_attempts")
        .select("*")
        .eq("sent", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useClimbingAttempts(sessionId: string) {
  return useQuery({
    queryKey: climbingAttemptsKey(sessionId),
    queryFn: async (): Promise<ClimbingAttemptRow[]> => {
      const { data, error } = await supabase
        .from("climbing_attempts")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });
}

export function useLogClimbingAttempt(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      grade: string;
      style: ClimbingStyle;
      sent: boolean;
      attempts_count: number;
    }): Promise<ClimbingAttemptRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("climbing_attempts")
        .insert({ ...input, session_id: sessionId, user_id: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: climbingAttemptsKey(sessionId) });
      queryClient.invalidateQueries({ queryKey: lastSentAttemptKey });
    },
  });
}

export function useDeleteClimbingAttempt(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("climbing_attempts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: climbingAttemptsKey(sessionId) });
      queryClient.invalidateQueries({ queryKey: lastSentAttemptKey });
    },
  });
}
