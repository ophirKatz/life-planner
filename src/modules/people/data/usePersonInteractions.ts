import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { Tables, TablesInsert } from "@/core/db/types";

export type PersonInteractionRow = Tables<"people_interactions">;
export type PersonInteractionInsert = TablesInsert<"people_interactions">;

export const personInteractionsKey = (personId: string) => ["people", personId, "interactions"] as const;

export function usePersonInteractions(personId: string) {
  return useQuery({
    queryKey: personInteractionsKey(personId),
    queryFn: async (): Promise<PersonInteractionRow[]> => {
      const { data, error } = await supabase
        .from("people_interactions")
        .select("*")
        .eq("person_id", personId)
        .order("interaction_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!personId,
  });
}

export function useLogPersonInteraction(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { note: string; interaction_date?: string }): Promise<PersonInteractionRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("people_interactions")
        .insert({ ...input, person_id: personId, user_id: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: personInteractionsKey(personId) }),
  });
}

export function useDeletePersonInteraction(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("people_interactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: personInteractionsKey(personId) }),
  });
}
