import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { PersonInsert, PersonRow, PersonUpdate } from "@/modules/people/types";

export const peopleKey = ["people"] as const;
export const personKey = (id: string) => ["people", id] as const;

export function usePeople() {
  return useQuery({
    queryKey: peopleKey,
    queryFn: async (): Promise<PersonRow[]> => {
      const { data, error } = await supabase
        .from("people")
        .select("*")
        .order("display_name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function usePerson(id: string) {
  return useQuery({
    queryKey: personKey(id),
    queryFn: async (): Promise<PersonRow> => {
      const { data, error } = await supabase.from("people").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<PersonInsert, "user_id">): Promise<PersonRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("people")
        .insert({ ...input, user_id: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: peopleKey }),
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: PersonUpdate }): Promise<PersonRow> => {
      const { data, error } = await supabase.from("people").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: peopleKey });
      queryClient.invalidateQueries({ queryKey: personKey(data.id) });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("people").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: peopleKey }),
  });
}
