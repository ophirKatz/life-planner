import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { BudgetCategoryRow } from "@/modules/budget/types";

export const budgetCategoriesKey = ["budget-categories"] as const;

export function useBudgetCategories() {
  return useQuery({
    queryKey: budgetCategoriesKey,
    queryFn: async (): Promise<BudgetCategoryRow[]> => {
      const { data, error } = await supabase.from("budget_categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateBudgetCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; monthly_limit: number | null }): Promise<BudgetCategoryRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("budget_categories")
        .insert({ ...input, user_id: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: budgetCategoriesKey }),
  });
}
