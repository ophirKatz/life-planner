// Optional near-realtime push channel receiver (DESIGN.md §6.4). Google
// Calendar "watch" channels are not registered in v1 (that requires a
// verified HTTPS domain + channel renewal bookkeeping, out of scope for the
// pull-based v1 sync) — this endpoint exists so the architecture documented
// in DESIGN.md §3 is wired end-to-end. If a notification does arrive, treat
// it as a hint to run the same sync the pg_cron schedule already performs.
import { corsHeaders, handleCors } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  const resourceState = req.headers.get("X-Goog-Resource-State");
  if (resourceState === "sync") {
    // Channel confirmation handshake — acknowledge, no sync needed yet.
    return new Response("ok", { headers: corsHeaders });
  }

  const projectUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (projectUrl && serviceRoleKey) {
    await fetch(`${projectUrl}/functions/v1/sync-google-calendar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${serviceRoleKey}` },
    });
  }

  return new Response("ok", { headers: corsHeaders });
});
