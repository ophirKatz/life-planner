// Scheduled by pg_cron (migration 0011) — delivers due reminders
// (DESIGN.md §4.2 notifications_outbox, §M7) via the Expo push API.
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";

Deno.serve(async (req) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  const admin = createAdminClient();
  const { data: due, error } = await admin
    .from("notifications_outbox")
    .select("id, user_id, title, body, data")
    .is("sent_at", null)
    .lte("deliver_at", new Date().toISOString())
    .limit(100);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!due || due.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userIds = [...new Set(due.map((n) => n.user_id))];
  const { data: tokens } = await admin
    .from("push_tokens")
    .select("user_id, expo_push_token")
    .in("user_id", userIds);

  const tokensByUser = new Map<string, string[]>();
  for (const t of tokens ?? []) {
    tokensByUser.set(t.user_id, [...(tokensByUser.get(t.user_id) ?? []), t.expo_push_token]);
  }

  const messages = due.flatMap((notification) =>
    (tokensByUser.get(notification.user_id) ?? []).map((to) => ({
      to,
      title: notification.title,
      body: notification.body,
      data: notification.data,
    }))
  );

  if (messages.length > 0) {
    await fetch(EXPO_PUSH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(messages),
    });
  }

  await admin
    .from("notifications_outbox")
    .update({ sent_at: new Date().toISOString() })
    .in(
      "id",
      due.map((n) => n.id)
    );

  return new Response(JSON.stringify({ sent: due.length, pushMessages: messages.length }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
