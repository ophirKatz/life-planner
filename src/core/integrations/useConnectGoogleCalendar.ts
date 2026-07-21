import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { env } from "@/core/config/env";
import { connectedAccountsKey } from "@/core/integrations/data/useConnectedAccounts";
import { supabase } from "@/core/db/supabase";

WebBrowser.maybeCompleteAuthSession();

const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

/** supabase-js's FunctionsHttpError.message is a generic "non-2xx status
 * code" string — the real message our function returned is in the response
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
  return error instanceof Error ? error.message : "Connection failed.";
}

/**
 * The *integration* OAuth flow (DESIGN.md §6.3) — distinct from sign-in.
 * Requests offline access + forces the consent screen so Google always
 * returns a refresh_token, then hands the authorization code (never a
 * token) to the oauth-exchange Edge Function, which does the real exchange
 * server-side. The device never sees an access or refresh token.
 */
export function useConnectGoogleCalendar() {
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);

  const redirectUri = useMemo(() => AuthSession.makeRedirectUri({ scheme: "lifeplanner" }), []);

  const request = useMemo(
    () =>
      new AuthSession.AuthRequest({
        clientId: env.googleOAuthClientId,
        scopes: ["openid", "email", "https://www.googleapis.com/auth/calendar.readonly"],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
        extraParams: { access_type: "offline", prompt: "consent" },
      }),
    [redirectUri]
  );

  const connect = useCallback(async () => {
    setError(null);
    setNeedsUpgrade(false);
    if (!env.googleOAuthClientId) {
      setError("Google integration is not configured (EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID is empty).");
      return;
    }

    setIsConnecting(true);
    try {
      const result = await request.promptAsync(discovery);
      if (result.type !== "success" || !result.params.code) {
        if (result.type === "error") setError(result.error?.message ?? "Connection failed.");
        return;
      }

      const { error: invokeError } = await supabase.functions.invoke("oauth-exchange", {
        body: {
          code: result.params.code,
          codeVerifier: request.codeVerifier,
          redirectUri,
        },
      });
      if (invokeError) {
        const message = await extractFunctionErrorMessage(invokeError);
        if (message.includes("PAYWALL:")) {
          setNeedsUpgrade(true);
        } else {
          setError(message);
        }
        return;
      }

      queryClient.invalidateQueries({ queryKey: connectedAccountsKey });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed.");
    } finally {
      setIsConnecting(false);
    }
  }, [request, redirectUri, queryClient]);

  return { connect, isConnecting, error, needsUpgrade };
}
