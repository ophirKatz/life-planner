import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { Tables } from "@/core/db/types";

export type PersonSummaryRow = Tables<"person_summaries">;

export const personSummaryKey = (personId: string) => ["people", personId, "summary"] as const;

/** The cached summary row, if one's ever been generated — read-only from the
 * client, written only by the summarize-person-interactions Edge Function. */
export function usePersonSummary(personId: string) {
  return useQuery({
    queryKey: personSummaryKey(personId),
    queryFn: async (): Promise<PersonSummaryRow | null> => {
      const { data, error } = await supabase
        .from("person_summaries")
        .select("*")
        .eq("person_id", personId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!personId,
  });
}

/** Triggers (re)generation. Rejects with a "PAYWALL: ..." message (see
 * isPaywallError) when the caller isn't on a pro subscription. */
export function useGeneratePersonSummary(personId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (forceRefresh: boolean): Promise<string> => {
      const { data, error } = await supabase.functions.invoke("summarize-person-interactions", {
        body: { person_id: personId, forceRefresh },
      });
      if (error) {
        const message = await extractFunctionErrorMessage(error);
        throw new Error(message);
      }
      return data.summary as string;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: personSummaryKey(personId) }),
  });
}

/** supabase-js's FunctionsHttpError.message is a generic "non-2xx status
 * code" string — the real message the function returned is in the response
 * body, reachable via `.context`. */
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
  return error instanceof Error ? error.message : "Couldn't generate a summary.";
}
