import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { ConnectedAccountRow } from "@/core/integrations/types";

export const connectedAccountsKey = ["connected-accounts"] as const;

export function useConnectedAccounts() {
  return useQuery({
    queryKey: connectedAccountsKey,
    queryFn: async (): Promise<ConnectedAccountRow[]> => {
      const { data, error } = await supabase
        .from("connected_accounts_safe")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useDisconnectAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase.functions.invoke("google-disconnect", { body: { accountId } });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: connectedAccountsKey }),
  });
}
