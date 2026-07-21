import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useMemo, useState } from "react";

import { env } from "@/core/config/env";
import { supabase } from "@/core/db/supabase";

WebBrowser.maybeCompleteAuthSession();

const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

/**
 * Sign-in identity only (id_token -> Supabase session). Distinct from the
 * Calendar *integration* OAuth in M5, which needs offline access + refresh
 * tokens exchanged and stored server-side — see supabase/functions/oauth-exchange.
 */
export function useGoogleSignIn() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectUri = useMemo(
    () => AuthSession.makeRedirectUri({ scheme: "lifeplanner" }),
    []
  );

  const request = useMemo(
    () =>
      new AuthSession.AuthRequest({
        clientId: env.googleOAuthClientId,
        scopes: ["openid", "profile", "email"],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
      }),
    [redirectUri]
  );

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    if (!env.googleOAuthClientId) {
      setError("Google sign-in is not configured (EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID is empty).");
      return;
    }

    setIsSigningIn(true);
    try {
      const result = await request.promptAsync(discovery);
      if (result.type !== "success" || !result.params.code) {
        if (result.type === "error") setError(result.error?.message ?? "Google sign-in failed.");
        return;
      }

      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: env.googleOAuthClientId,
          code: result.params.code,
          redirectUri,
          extraParams: { code_verifier: request.codeVerifier ?? "" },
        },
        discovery
      );

      if (!tokenResult.idToken) {
        setError("Google did not return an id_token.");
        return;
      }

      const { error: supabaseError } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: tokenResult.idToken,
        access_token: tokenResult.accessToken,
      });
      if (supabaseError) setError(supabaseError.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed.");
    } finally {
      setIsSigningIn(false);
    }
  }, [request, redirectUri]);

  return { signInWithGoogle, isSigningIn, error };
}
