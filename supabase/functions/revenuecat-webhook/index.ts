// RevenueCat -> subscriptions mirror (DESIGN.md §7.2). The client reads the
// RC SDK for instant UX; this function is the server truth the DB triggers
// (migration 0010) actually check. Configure the webhook in the RevenueCat
// dashboard with a custom Authorization header equal to REVENUECAT_WEBHOOK_SECRET.
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";

const ACTIVE_EVENT_TYPES = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "NON_RENEWING_PURCHASE",
  "PRODUCT_CHANGE",
]);

interface RevenueCatEvent {
  type: string;
  app_user_id: string;
  entitlement_ids?: string[];
  expiration_at_ms?: number | null;
}

Deno.serve(async (req) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  const expectedSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
  const authHeader = req.headers.get("Authorization");
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { event } = (await req.json()) as { event: RevenueCatEvent };
    const entitlements = event.entitlement_ids ?? [];
    const hasProEntitlement = entitlements.includes("pro");

    let isPro: boolean | undefined;
    if (event.type === "EXPIRATION") {
      isPro = false;
    } else if (ACTIVE_EVENT_TYPES.has(event.type)) {
      isPro = hasProEntitlement;
    }
    // Other event types (BILLING_ISSUE, TRANSFER, TEST, …) update metadata
    // only — is_pro is left as-is rather than guessed.

    const admin = createAdminClient();
    const update: Record<string, unknown> = {
      user_id: event.app_user_id,
      rc_customer_id: event.app_user_id,
      active_entitlements: entitlements,
      current_period_end: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
    };
    if (isPro !== undefined) update.is_pro = isPro;

    const { error } = await admin.from("subscriptions").upsert(update, { onConflict: "user_id" });
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
