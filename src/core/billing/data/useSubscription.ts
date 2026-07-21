import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { Tables } from "@/core/db/types";

export type SubscriptionRow = Tables<"subscriptions">;

export const subscriptionKey = ["subscription"] as const;

/** Server truth for entitlement (DESIGN.md §7.2) — the RC SDK is for instant
 * client UX; this table, written only by revenuecat-webhook, is what the DB
 * triggers actually check and what gating UI should read. */
export function useSubscription() {
  return useQuery({
    queryKey: subscriptionKey,
    queryFn: async (): Promise<SubscriptionRow | null> => {
      const { data, error } = await supabase.from("subscriptions").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
