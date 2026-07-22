import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { Tables } from "@/core/db/types";

export type FeatureFlagRow = Tables<"feature_flags">;

export const featureFlagsKey = ["admin", "feature-flags"] as const;

/** Generic cross-cutting kill switches (feature_flags table) — for
 * functionality that isn't tied to a single module row, e.g. an AI feature
 * living inside a free module. Readable by any authenticated user (Edge
 * Functions and the client both check these), writable only by admins. */
export function useFeatureFlags() {
  return useQuery({
    queryKey: featureFlagsKey,
    queryFn: async (): Promise<FeatureFlagRow[]> => {
      const { data, error } = await supabase.from("feature_flags").select("*").order("key", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useSetFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      const { error } = await supabase.from("feature_flags").update({ enabled }).eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: featureFlagsKey }),
  });
}
