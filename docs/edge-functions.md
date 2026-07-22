# Edge Functions

Deno functions in `supabase/functions/<name>/index.ts`, one folder per
function. This is where every external API call and every privileged
operation (encrypted tokens, service-role writes) lives — the client never
holds a third-party API key, an OAuth token, or the service-role key.

## Anatomy of a function

```ts
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAdminClient, createUserClient } from "../_shared/supabaseAdmin.ts";

Deno.serve(async (req: Request) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header.");

    const userClient = createUserClient(authHeader);
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Not authenticated.");

    // ... do the work ...

    return new Response(JSON.stringify({ /* result */ }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

Every function follows this exact shape: CORS preflight → auth check →
try/catch → `{error: string}` JSON on failure. Copy the closest existing
function rather than starting from a blank file.

## `_shared/` helpers

- **`cors.ts`** — `corsHeaders`, `handleCors(req)`. Call `handleCors` first
  in every function, even ones you think are never browser-invoked.
- **`supabaseAdmin.ts`** — `createUserClient(authHeader)` (anon key + the
  caller's JWT forwarded, so RLS applies — use this whenever the caller's own
  permissions are the right check) and `createAdminClient()` (service role,
  bypasses RLS — use only when the function must read/write across users,
  or write to a table the client has no insert/update policy for, like
  `person_summaries` or `focus_summaries`). Default to the user client;
  reach for the admin client only when you have a specific reason.
- **`crypto.ts`** — `encryptToken`/`decryptToken`, AES-256-GCM via Web
  Crypto, keyed by the `TOKEN_ENCRYPTION_KEY` secret. Anything that touches
  an OAuth access/refresh token goes through these before it's stored.
- **`google.ts`** — `exchangeCodeForTokens`, `refreshAccessToken`,
  `fetchGoogleUserinfo`, `listCalendarEvents` and their response types.

## Conventions

- **Errors that should open the paywall** get an `error` message prefixed
  `"PAYWALL: ..."` — the client's `isPaywallError()`
  (`src/core/billing/paywall.ts`) checks for that prefix specifically, so any
  other error string just shows as a normal failure. Use a plain message
  (no prefix) for anything that isn't a monetization gate, even if it's also
  a 4xx — e.g. `enforce_module_limits`'s inactive-module rejection uses
  `MODULE_UNAVAILABLE:`, not `PAYWALL:`, because upgrading wouldn't fix it. The
  AI functions additionally check the `feature_flags` table (admin-controlled
  kill switch, independent of subscription) and use `FEATURE_DISABLED:` the
  same way — see `summarize-person-interactions` for the pattern.
- **Caching pattern for generate-on-demand AI results**
  (`summarize-person-interactions`, `generate-focus-summary`): a small table
  (`status`, `summary`/`error`, `generated_at`, unique on `(user_id, ...)`)
  written only by the function via the admin client; the client reads it
  directly (RLS: select-own only, no insert/update policy) and calls the
  function again to regenerate. Check a time-based staleness window
  (these two use 24h) before hitting the model again.
- **Never fetch a third-party API directly from the app.** Even something
  that needs no secret (Open-Meteo's forecast/geocoding APIs) still goes
  through a function — `fetch-weather`, `search-weather-location` — so the
  app never makes an unproxied external call and every provider integration
  lives in one place.

## Current functions

| Function | Purpose |
|---|---|
| `oauth-exchange` | Google Calendar integration OAuth code exchange (§6.3) |
| `sync-google-calendar` | Pulls calendar events for connected accounts, via `pg_cron` |
| `google-webhook` | Google Calendar push-notification channel receiver |
| `google-disconnect` | Revokes + deletes a connected Google account |
| `revenuecat-webhook` | RevenueCat → `subscriptions` entitlement sync |
| `send-notifications` | Delivers due rows from `notifications_outbox`, via `pg_cron` |
| `summarize-person-interactions` | AI relationship summary (People pro feature) |
| `generate-focus-summary` | AI daily/weekly digest (Focus module) |
| `fetch-weather` | Live forecast proxy (Open-Meteo) |
| `search-weather-location` | Geocoding proxy (Open-Meteo) |

## Local dev

```sh
supabase functions serve <name> --env-file .env.local   # secrets for local testing
```

## Deploy

```sh
supabase functions deploy <name>
```

Webhook-style endpoints that Google/RevenueCat call directly (no Supabase
session) need `--no-verify-jwt`: `google-webhook`, `revenuecat-webhook`.
Every other function keeps default JWT verification.

## Secrets

Set once per project, never committed:

```sh
supabase secrets set \
  GOOGLE_OAUTH_CLIENT_ID=... \
  GOOGLE_OAUTH_CLIENT_SECRET=... \
  TOKEN_ENCRYPTION_KEY=$(openssl rand -base64 32) \
  REVENUECAT_WEBHOOK_SECRET=... \
  ANTHROPIC_API_KEY=...
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are injected
automatically — don't set them. `pg_cron` jobs (migrations 0009, 0011) need a
one-time Vault secret to authenticate their own calls into these functions —
see `README.md`'s setup step 6.
