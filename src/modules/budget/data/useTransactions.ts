import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endOfMonth, formatISO, startOfMonth } from "date-fns";

import { supabase } from "@/core/db/supabase";
import type { TransactionInsert, TransactionRow } from "@/modules/budget/types";

export const transactionsKey = (monthStart: string) => ["transactions", monthStart] as const;

/** Transactions for the month containing `reference` (defaults to now). */
export function useTransactions(reference: Date = new Date()) {
  const monthStart = formatISO(startOfMonth(reference), { representation: "date" });
  const monthEnd = formatISO(endOfMonth(reference), { representation: "date" });

  return useQuery({
    queryKey: transactionsKey(monthStart),
    queryFn: async (): Promise<TransactionRow[]> => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .gte("occurred_at", monthStart)
        .lte("occurred_at", monthEnd)
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<TransactionInsert, "user_id">): Promise<TransactionRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...input, user_id: auth.user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
}
