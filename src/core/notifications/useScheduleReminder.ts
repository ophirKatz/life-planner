import { useMutation } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { Json } from "@/core/db/types";

export interface ScheduleReminderInput {
  title: string;
  body: string;
  deliverAt: Date;
  data?: Record<string, unknown>;
}

/** Inserts a notifications_outbox row (DESIGN.md §4.2) — delivered by the
 * send-notifications Edge Function on its pg_cron schedule (M7). */
export function useScheduleReminder() {
  return useMutation({
    mutationFn: async (input: ScheduleReminderInput) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");

      const { error } = await supabase.from("notifications_outbox").insert({
        user_id: auth.user.id,
        title: input.title,
        body: input.body,
        deliver_at: input.deliverAt.toISOString(),
        data: (input.data ?? {}) as Json,
      });
      if (error) throw error;
    },
  });
}
