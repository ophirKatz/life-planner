const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";
const CALENDAR_EVENTS_ENDPOINT =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export interface GoogleTokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  scope: string;
}

// The device authorizes with a public "installed app" OAuth client (iOS/
// Android type, custom-scheme redirect, no client_secret) — the same one it
// uses for sign-in — so this server-side exchange must authenticate the same
// way: client_id + PKCE verifier only. GOOGLE_OAUTH_CLIENT_SECRET is only
// sent if you deliberately registered a confidential (Web) client instead;
// most installed-app setups won't set it at all.
function clientCredentials(): { clientId: string; clientSecret?: string } {
  const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
  if (!clientId) throw new Error("GOOGLE_OAUTH_CLIENT_ID is not set.");
  return { clientId, clientSecret: Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET") ?? undefined };
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<GoogleTokenSet> {
  const { clientId, clientSecret } = clientCredentials();
  const params: Record<string, string> = {
    client_id: clientId,
    code,
    code_verifier: codeVerifier,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };
  if (clientSecret) params.client_secret = clientSecret;

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
    scope: json.scope,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokenSet> {
  const { clientId, clientSecret } = clientCredentials();
  const params: Record<string, string> = {
    client_id: clientId,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  };
  if (clientSecret) params.client_secret = clientSecret;

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  if (!res.ok) throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return { accessToken: json.access_token, expiresIn: json.expires_in, scope: json.scope };
}

export async function fetchGoogleUserinfo(accessToken: string): Promise<{ sub: string; email: string }> {
  const res = await fetch(USERINFO_ENDPOINT, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) throw new Error(`Google userinfo fetch failed: ${res.status}`);
  return res.json();
}

export interface GoogleCalendarEvent {
  id: string;
  status: "confirmed" | "tentative" | "cancelled";
  etag: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
  recurrence?: string[];
  attendees?: { email: string }[];
}

export interface GoogleCalendarPage {
  events: GoogleCalendarEvent[];
  nextPageToken?: string;
  nextSyncToken?: string;
}

/** One page of the events.list API — pull() in sync-google-calendar loops
 * pages until nextSyncToken (or a fresh full sync on a 410 Gone). */
export async function listCalendarEvents(
  accessToken: string,
  { syncToken, pageToken, timeMin }: { syncToken?: string; pageToken?: string; timeMin?: string }
): Promise<GoogleCalendarPage | { expiredSyncToken: true }> {
  const params = new URLSearchParams({ maxResults: "250", singleEvents: "true" });
  if (syncToken) {
    params.set("syncToken", syncToken);
  } else if (timeMin) {
    params.set("timeMin", timeMin);
  }
  if (pageToken) params.set("pageToken", pageToken);

  const res = await fetch(`${CALENDAR_EVENTS_ENDPOINT}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 410) return { expiredSyncToken: true };
  if (!res.ok) throw new Error(`Google Calendar events.list failed: ${res.status} ${await res.text()}`);

  const json = await res.json();
  return {
    events: json.items ?? [],
    nextPageToken: json.nextPageToken,
    nextSyncToken: json.nextSyncToken,
  };
}
