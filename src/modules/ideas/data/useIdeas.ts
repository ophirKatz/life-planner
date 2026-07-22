import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { IdeaInsert, IdeaRow, IdeaUpdate } from "@/modules/ideas/types";

export const ideasKey = ["ideas"] as const;
export const ideaKey = (id: string) => ["ideas", id] as const;

export function useIdeas() {
  return useQuery({
    queryKey: ideasKey,
    queryFn: async (): Promise<IdeaRow[]> => {
      const { data, error } = await supabase.from("ideas").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useIdea(id: string) {
  return useQuery({
    queryKey: ideaKey(id),
    queryFn: async (): Promise<IdeaRow> => {
      const { data, error } = await supabase.from("ideas").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<IdeaInsert, "user_id">): Promise<IdeaRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("ideas")
        .insert({ ...input, user_id: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ideasKey }),
  });
}

export function useUpdateIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: IdeaUpdate }): Promise<IdeaRow> => {
      const { data, error } = await supabase.from("ideas").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ideasKey });
      queryClient.invalidateQueries({ queryKey: ideaKey(data.id) });
    },
  });
}

export function useDeleteIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("ideas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ideasKey }),
  });
}
