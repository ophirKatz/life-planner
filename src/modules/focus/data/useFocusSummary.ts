import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { FocusPeriod, FocusSummaryPayload, FocusSummaryRow } from "@/modules/focus/types";

export const focusSummaryKey = (period: FocusPeriod) => ["focus-summaries", period] as const;

/** Same as FocusSummaryRow, but with `summary` narrowed from the generic
 * `Json` column type to the shape generate-focus-summary actually writes. */
export type FocusSummary = Omit<FocusSummaryRow, "summary"> & { summary: FocusSummaryPayload | null };

/** The cached digest for a period, if one's ever been generated — read-only
 * from the client, written only by the generate-focus-summary Edge Function. */
export function useFocusSummary(period: FocusPeriod) {
  return useQuery({
    queryKey: focusSummaryKey(period),
    queryFn: async (): Promise<FocusSummary | null> => {
      const { data, error } = await supabase
        .from("focus_summaries")
        .select("*")
        .eq("period", period)
        .maybeSingle();
      if (error) throw error;
      return data as FocusSummary | null;
    },
  });
}

/** Rejects with a "PAYWALL: ..." message (see isPaywallError) when the
 * caller isn't on a pro subscription. */
export function useGenerateFocusSummary(period: FocusPeriod) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<FocusSummaryPayload> => {
      const { data, error } = await supabase.functions.invoke("generate-focus-summary", {
        body: { period },
      });
      if (error) {
        const message = await extractFunctionErrorMessage(error);
        throw new Error(message);
      }
      return data.summary as FocusSummaryPayload;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: focusSummaryKey(period) }),
  });
}

async function extractFunctionErrorMessage(error: unknown): Promise<string> {
  if (error && typeof error === "object" && "context" in error) {
    try {
      const context = (error as { context: Response }).context;
      const body = await context.json();
      if (typeof body?.error === "string") return body.error;
    } catch {
      // fall through to the generic message below
    }
  }
  return error instanceof Error ? error.message : "Couldn't generate a digest.";
}
