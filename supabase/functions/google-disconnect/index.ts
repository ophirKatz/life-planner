// Disconnect side of §6.5: revoke with Google, then delete the row. The
// on-delete-set-null FK on calendar_events.account_id (migration 0004) does
// the rest — synced events are kept, just orphaned from the account.
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { decryptToken } from "../_shared/crypto.ts";
import { createAdminClient, createUserClient } from "../_shared/supabaseAdmin.ts";

Deno.serve(async (req) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header.");

    const { accountId } = await req.json();
    if (!accountId) throw new Error("accountId is required.");

    const userClient = createUserClient(authHeader);
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Not authenticated.");

    const admin = createAdminClient();
    const { data: account, error: fetchError } = await admin
      .from("connected_accounts")
      .select("id, user_id, access_token_enc")
      .eq("id", accountId)
      .single();
    if (fetchError || !account) throw new Error("Account not found.");
    if (account.user_id !== user.id) throw new Error("Not authorized to disconnect this account.");

    try {
      const accessToken = await decryptToken(account.access_token_enc);
      await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, { method: "POST" });
    } catch {
      // Best-effort: an already-expired/invalid token shouldn't block local disconnect.
    }

    const { error: deleteError } = await admin.from("connected_accounts").delete().eq("id", accountId);
    if (deleteError) throw deleteError;

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
