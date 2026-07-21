// Server-side half of the Google Calendar *integration* OAuth flow
// (DESIGN.md §6.3) — distinct from the sign-in id_token flow, which never
// touches this function. The device sends only { code, codeVerifier,
// redirectUri }; this function exchanges the code with Google, encrypts the
// resulting tokens, stores them, and returns a token-free account row.
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { encryptToken } from "../_shared/crypto.ts";
import { exchangeCodeForTokens, fetchGoogleUserinfo } from "../_shared/google.ts";
import { createAdminClient, createUserClient } from "../_shared/supabaseAdmin.ts";

Deno.serve(async (req) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header.");

    const { code, codeVerifier, redirectUri } = await req.json();
    if (!code || !codeVerifier || !redirectUri) {
      throw new Error("code, codeVerifier, and redirectUri are required.");
    }

    const userClient = createUserClient(authHeader);
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Not authenticated.");

    const tokens = await exchangeCodeForTokens(code, codeVerifier, redirectUri);
    const userinfo = await fetchGoogleUserinfo(tokens.accessToken);

    const admin = createAdminClient();
    const tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000).toISOString();
    const accessTokenEnc = await encryptToken(tokens.accessToken);

    const { data: existing } = await admin
      .from("connected_accounts")
      .select("id, refresh_token_enc")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .eq("provider_account_id", userinfo.sub)
      .maybeSingle();

    // Google only returns a refresh_token on the first consent unless the
    // client forces prompt=consent; preserve the existing one otherwise.
    const refreshTokenEnc = tokens.refreshToken
      ? await encryptToken(tokens.refreshToken)
      : existing?.refresh_token_enc;

    if (!refreshTokenEnc) {
      throw new Error(
        "Google did not return a refresh token and none is on file. Reconnect with consent prompted."
      );
    }

    const { data: saved, error: upsertError } = await admin
      .from("connected_accounts")
      .upsert(
        {
          user_id: user.id,
          provider: "google",
          provider_account_id: userinfo.sub,
          email: userinfo.email,
          scopes: tokens.scope.split(" "),
          status: "active",
          access_token_enc: accessTokenEnc,
          refresh_token_enc: refreshTokenEnc,
          token_expires_at: tokenExpiresAt,
        },
        { onConflict: "user_id,provider,provider_account_id" }
      )
      .select("id, provider, provider_account_id, email, scopes, status, token_expires_at, created_at")
      .single();
    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ account: saved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
