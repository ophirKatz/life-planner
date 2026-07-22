# Life Planner

A cross-platform (iOS-first) Expo life-planner where you compose your dashboard
from a marketplace of first-party feature modules — Tasks, Calendar, People,
and Shopping are free; Habits and a growing set of pro modules (Focus,
Recipes, Climbing, Weather, Budget, Workouts, Travel, Ideas, Wishlists) sit
behind the paywall. Google Calendar sync and RevenueCat billing are
first-class, cross-cutting infrastructure. Fully relational Supabase backend,
multi-tenant and paywalled from day one.

See [`DESIGN.md`](./DESIGN.md) for the full architecture spec and
[`CLAUDE_CODE_PROMPT.md`](./CLAUDE_CODE_PROMPT.md) for the build plan this
project followed, milestone by milestone. If you're an AI agent working in
this repo, start at [`CLAUDE.md`](./CLAUDE.md) instead — it links to the
[`docs/`](./docs) guides (design system, best practices, Edge Functions) too.

## Stack

Expo SDK 54 + Expo Router + TypeScript (strict) · NativeWind v4 + React Native
Reusables (`@rn-primitives/*`) · TanStack Query + Zustand · react-hook-form +
zod · date-fns · `@shopify/flash-list` · victory-native (charts) ·
react-native-reanimated + moti + expo-haptics · Supabase (Postgres + RLS + Edge
Functions + `pg_cron`) · RevenueCat · `expo-notifications`.

## Setup

1. **Install dependencies**

   ```sh
   npm install
   ```

2. **Environment variables** — copy `.env.example` to `.env` and fill in the
   client-side values (see that file for what's client-safe vs. server-only):

   ```sh
   cp .env.example .env
   ```

   At minimum you need `EXPO_PUBLIC_SUPABASE_URL` and
   `EXPO_PUBLIC_SUPABASE_ANON_KEY` for the app to boot at all (auth will show
   the Login screen either way; Google sign-in additionally needs
   `EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID`).

3. **Supabase project** — create one (or use an existing one) and apply the
   migrations in order:

   ```sh
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

   Then generate types to keep `src/core/db/types.ts` in sync after any future
   migration:

   ```sh
   EXPO_PUBLIC_SUPABASE_PROJECT_ID=<your-project-ref> npm run db:types
   ```

4. **Edge Function secrets** (server-side only — never in `.env` /
   `EXPO_PUBLIC_*`):

   ```sh
   supabase secrets set \
     GOOGLE_OAUTH_CLIENT_ID=... \
     GOOGLE_OAUTH_CLIENT_SECRET=... \
     TOKEN_ENCRYPTION_KEY=$(openssl rand -base64 32) \
     REVENUECAT_WEBHOOK_SECRET=... \
     ANTHROPIC_API_KEY=...
   ```

   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are
   injected automatically into every Edge Function — don't set them yourself.

5. **Deploy Edge Functions** — see [`docs/edge-functions.md`](./docs/edge-functions.md)
   for what each one does:

   ```sh
   supabase functions deploy oauth-exchange
   supabase functions deploy sync-google-calendar
   supabase functions deploy google-webhook --no-verify-jwt
   supabase functions deploy google-disconnect
   supabase functions deploy revenuecat-webhook --no-verify-jwt
   supabase functions deploy send-notifications
   supabase functions deploy summarize-person-interactions
   supabase functions deploy generate-focus-summary
   supabase functions deploy fetch-weather
   supabase functions deploy search-weather-location
   ```

6. **One-time Vault secret** for the `pg_cron` jobs (migrations 0009, 0011) to
   authenticate their calls to your Edge Functions — run once in the Supabase
   SQL editor with your project's real service-role key (never commit it):

   ```sql
   select vault.create_secret('<your-service-role-key>', 'service_role_key');
   ```

7. **Run the app**:

   ```sh
   npm run ios      # or: npm run android
   ```

## Google OAuth setup

Two separate Google Cloud OAuth *uses*, one client:

- Create an **iOS** (and/or **Android**) OAuth client in
  [Google Cloud Console](https://console.cloud.google.com/apis/credentials) —
  a public "installed app" client, no secret, with the app's custom URL scheme
  (`lifeplanner://`) as the redirect. This is `EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID`
  *and* the server's `GOOGLE_OAUTH_CLIENT_ID` — same value, both places.
- Enable the Google provider in **Supabase Auth settings** and add that same
  client ID to the allowed list, for the sign-in `signInWithIdToken` flow.
- The Calendar *integration* (connect, in Profile → Integrations) reuses the
  same client but requests `calendar.readonly` with `access_type=offline` +
  `prompt=consent`, so Google always returns a refresh token. See
  `src/core/integrations/useConnectGoogleCalendar.ts` and
  `supabase/functions/oauth-exchange`.
- `GOOGLE_OAUTH_CLIENT_SECRET` is **only** needed if you deliberately register
  a confidential (Web) client instead — most installed-app setups leave it unset.

## RevenueCat setup

1. Create a RevenueCat project, an entitlement called `pro`, and a `default`
   offering with Monthly + Annual packages.
2. Set `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
   from the RevenueCat dashboard.
3. Point a RevenueCat webhook at
   `https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook` with a
   custom `Authorization: Bearer <secret>` header matching
   `REVENUECAT_WEBHOOK_SECRET`.

### ⚠️ Dev build required for RevenueCat and push notifications

`react-native-purchases` / `react-native-purchases-ui` and real remote push
delivery **do not work in Expo Go** — Expo Go only runs RevenueCat's limited
Preview API mode, and has no push service registration at all. To test
billing or notifications end-to-end you need a
[development build](https://docs.expo.dev/develop/development-builds/introduction/):

```sh
npx expo prebuild
npx expo run:ios      # or: npx expo run:android
```

Everything else in the app (auth, all 5 modules, links, Google Calendar sync,
the paywall's *DB-side* enforcement) works fine in Expo Go.

## Adding a new module

A module is a self-contained folder implementing the `ModuleDefinition`
contract (`src/core/modules/types.ts`, see `DESIGN.md §5.1`). Adding one never
requires touching existing platform code — only:

1. **A migration** for the module's own tables, following the pattern in
   `supabase/migrations/0003_tasks_module.sql` — RLS policies, an
   `updated_at` trigger, and (if the module is linkable, see below) a
   `cleanup_links_on_delete('<your-type>')` trigger.
2. **A seed row** in the `modules` catalog table (`slug`, `name`,
   `description`, `icon`, `tier`).
3. **A folder** at `src/modules/<slug>/` with:
   - `types.ts` — row types derived from `src/core/db/types.ts`.
   - `data/` — TanStack Query hooks (list/create/update/delete). Screens and
     widgets must only touch Supabase through these hooks, never ad hoc.
   - `screens/` — the module's own list/detail/new screens (plain React
     components, no Expo Router coupling).
   - `components/` — a dashboard widget component and any shared row/form
     components.
   - `linkable.ts` (optional) — `resolve(id)` and `listAll()` if the module
     participates in the cross-module `links` graph (DESIGN.md §4.5).
   - `automations.ts` (optional) — event-bus subscribers (DESIGN.md §8); see
     `src/modules/tasks/automations.ts` for the worked example.
   - `definition.ts` — exports the `ModuleDefinition` object wiring all of the
     above together.
4. **Thin route files** under `app/modules/<slug>/` that just import and
   render the screens from step 3 (see any existing module for the pattern).
5. **One entry** in `src/modules/index.ts` — `registerModule()` +
   `registerLinkable()` for each module, in the bootstrap list.

That's it — the Store screen, Home dashboard, quick-add sheet, and links UI
all pick up the new module automatically once it's registered.

## Testing

- `npm run typecheck` / `npm run lint` — the app and Deno Edge Functions are
  separate TypeScript projects (see `tsconfig.json`'s `exclude` and
  `eslint.config.js`'s `ignores`); Edge Functions are Deno, not Node.
- `supabase/tests/*.test.sql` — RLS isolation, link-cleanup triggers, and
  paywall-limit enforcement, runnable directly against your project via the
  Supabase SQL editor (each wraps its assertions in a transaction that's
  rolled back, so nothing is left behind).
