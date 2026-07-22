import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { RecipeInsert, RecipeRow, RecipeUpdate } from "@/modules/recipes/types";

export const recipesKey = ["recipes"] as const;
export const recipeKey = (id: string) => ["recipes", id] as const;

export function useRecipes() {
  return useQuery({
    queryKey: recipesKey,
    queryFn: async (): Promise<RecipeRow[]> => {
      const { data, error } = await supabase.from("recipes").select("*").order("title", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: recipeKey(id),
    queryFn: async (): Promise<RecipeRow> => {
      const { data, error } = await supabase.from("recipes").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<RecipeInsert, "user_id">): Promise<RecipeRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("recipes")
        .insert({ ...input, user_id: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recipesKey }),
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: RecipeUpdate }): Promise<RecipeRow> => {
      const { data, error } = await supabase.from("recipes").update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: recipesKey });
      queryClient.invalidateQueries({ queryKey: recipeKey(data.id) });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recipesKey }),
  });
}
