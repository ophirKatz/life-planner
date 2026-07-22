# Setup guide — what's left to do manually

Everything in the repo is code and migrations; nothing has been run against
a real backend yet. This is the checklist of manual account setup, API keys,
and decisions needed before the app actually runs end-to-end. Written in the
order you'd realistically do it — each section unblocks the next.

## 1. Supabase project

- [ ] Create a project at [supabase.com](https://supabase.com) (or reuse one).
- [ ] `supabase link --project-ref <ref>` then `supabase db push` — applies
      all 23 migrations in order.
- [ ] `EXPO_PUBLIC_SUPABASE_PROJECT_ID=<ref> npm run db:types` — regenerates
      `src/core/db/types.ts` from the real schema. (Everything I hand-edited
      into that file this session should match, but this is the source of
      truth — worth running to confirm.)
- [ ] Run `supabase/tests/*.test.sql` in the SQL editor — each wraps its
      assertions in a rolled-back transaction, so it's safe to run directly
      against the real project. Confirms RLS isolation, link-cleanup
      triggers, and paywall-limit enforcement actually work before you trust
      them.
- [ ] One-time Vault secret so `pg_cron` jobs can call your Edge Functions:
      ```sql
      select vault.create_secret('<your-service-role-key>', 'service_role_key');
      ```
      (migrations 0009 and 0011 reference this by name.)

**Decision:** which Supabase plan. Free tier works for development; `pg_cron`
and daily-active paywall checks are lightweight, but decide before you have
real users whether you need Pro for backups/no-pause.

## 2. Google Cloud (sign-in + Calendar integration)

- [ ] Create an OAuth client in
      [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
      — **iOS** and/or **Android** type (public "installed app," no secret),
      redirect scheme `lifeplanner://` (matches `app.json`'s `"scheme"` — if
      you rename the app, update both together).
- [ ] Enable the **Google Calendar API** for the project.
- [ ] In **Supabase Auth settings**, enable the Google provider and add the
      same client ID — this is what powers sign-in (`signInWithIdToken`).
- [ ] Set `EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` and (server-side)
      `GOOGLE_OAUTH_CLIENT_ID` to the same value.

**Decision — OAuth consent screen mode.** `calendar.readonly` is a
"sensitive" scope. In **Testing** mode you can use it immediately with up to
100 explicitly-added test users, no review. Going to **Production** with
real, unlisted users requires Google's OAuth verification process — a
privacy policy URL, a homepage, and (for sensitive scopes) a demo video —
which can take days to weeks. Decide now which mode you're targeting for
launch; don't leave it until you're ready to ship.

## 3. RevenueCat + app store accounts

- [ ] Apple Developer Program ($99/yr) and/or Google Play Console ($25
      one-time) — required to create real in-app purchase products, not
      optional for a working paywall.
- [ ] Create the Monthly/Annual subscription products in App Store Connect /
      Play Console.
- [ ] Create a RevenueCat project, entitlement `pro`, offering `default` with
      those two packages attached.
- [ ] Set `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
      from the RevenueCat dashboard.
- [ ] Point a RevenueCat webhook at
      `https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook`
      with a custom `Authorization: Bearer <secret>` header, and set that
      same value as the `REVENUECAT_WEBHOOK_SECRET` Edge Function secret.

**Decision — pricing.** Nothing in the code sets a price; that's set when
you create the products in App Store Connect / Play Console. Figure out
Monthly vs. Annual pricing (and whether to offer a trial) before creating
them — RevenueCat reads whatever you configure there.

**Decision — is `insights` a real module?** The `modules` catalog table has
a seeded `pro`-tier row called `insights` ("Advanced analytics across your
modules") from the very first migration, but no `ModuleDefinition` was ever
registered for it (`src/modules/index.ts`) — it exists only to prove
tier-gating works end to end. Right now it would show up in the Store as an
enableable Pro module and silently render nothing if enabled. Either build
it as a real module or remove the seed row in a new migration before this
goes in front of real users.

## 4. Anthropic (AI features)

- [ ] Get an API key from [console.anthropic.com](https://console.anthropic.com).
- [ ] `supabase secrets set ANTHROPIC_API_KEY=...`

Powers two pro features: the People module's AI relationship summary and the
Focus module's AI digest. Both call `claude-haiku-4-5`, cached for 24h per
user, so cost scales with distinct users hitting "Generate," not app opens.

**Decision:** set a spend limit / usage alert on the Anthropic account.
There's currently no app-side rate limit beyond the 24h cache — a user
mashing "Regenerate" repeatedly is a real (if minor) cost path.

## 5. Push notifications + dev builds

- [ ] `app.json` has **no `extra.eas.projectId` set yet** —
      `registerForPushNotifications.ts` needs one to call
      `getExpoPushTokenAsync`. Run `eas init` (or `eas build:configure`) to
      create/link an EAS project; it writes the id into `app.json` for you.
- [ ] RevenueCat and push both **do not work in Expo Go**. Build a dev build:
      ```sh
      npx expo prebuild
      npx expo run:ios      # or: npx expo run:android
      ```
      (needs Xcode locally for iOS, Android Studio for Android).

Note: `send-notifications`'s Edge Function calls Expo's push endpoint
unauthenticated — despite `.env.example` listing `EXPO_ACCESS_TOKEN`, the
function doesn't currently read it. Not blocking; only revisit if Expo
starts requiring it or you adopt their "Enhanced Security" push feature.

## 6. Weather

Nothing to do — `fetch-weather` / `search-weather-location` proxy
[Open-Meteo](https://open-meteo.com), which is free and keyless.

## 6a. Admin dashboard + test accounts

- [ ] **Bootstrap yourself as admin.** Sign in once with the account you want
      as admin, then in the Supabase SQL editor:
      ```sql
      update public.profiles set is_admin = true
      where id = (select id from auth.users where email = 'you@example.com');
      ```
      This unlocks the "Admin dashboard" entry on the Profile tab — a module
      is_active/tier toggle list and the `feature_flags` kill switches
      (DESIGN.md §7.4). There's no seed admin; this SQL step is the only way
      in.
- [ ] **Create the other two test accounts** (sign in with two more Google
      accounts, or however your auth setup allows multiple identities):
      - **Free, non-admin** — no setup needed, this is the default state for
        any new sign-up.
      - **Pro, non-admin** — either complete a real RevenueCat sandbox
        purchase on that account, or, faster for UI testing, set it directly:
        ```sql
        update public.subscriptions set is_pro = true
        where user_id = (select id from auth.users where email = 'pro-test@example.com');
        ```
        This bypasses RevenueCat entirely — fine for exercising pro-gated UI,
        but it doesn't validate the real purchase → webhook → entitlement
        path. Test that path for real at least once before shipping billing
        changes.

**Decision — who else gets `is_admin`.** There's no invite flow or admin list
UI yet; granting/revoking is a one-line SQL update. Fine for a single-operator
app; revisit if you ever have more than one admin.

## 7. Client env file

- [ ] `cp .env.example .env`, fill in every `EXPO_PUBLIC_*` value from the
      steps above. At minimum, `EXPO_PUBLIC_SUPABASE_URL` +
      `EXPO_PUBLIC_SUPABASE_ANON_KEY` are required for the app to boot at
      all (you'll land on the Login screen without the rest).

## 8. Deploy the Edge Functions

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

## Other decisions worth making now, not later

- **App identity:** `app.json` currently ships placeholder values —
  `bundleIdentifier`/`package` `com.lifeplanner.app`, scheme `lifeplanner`,
  name "life-planner." Decide the real product name/bundle id before you
  register store listings or OAuth redirect URIs against the placeholder —
  changing it later means updating the Google OAuth client, EAS project, and
  both store listings together.
- **Privacy policy + Terms of Service URLs** — required for Google OAuth
  verification (§2), App Store/Play Store submission, and RevenueCat. Don't
  have to be fancy, but they have to exist and be hosted somewhere before
  you submit anywhere.
- **Free tier's connected-account limit (2) and habits-is-pro decision** are
  already implemented (DESIGN.md §7.3) — nothing to configure, just flagging
  that these are live product decisions already baked into the DB triggers,
  not proposals.
- **Visual/UX verification** — none of this session's UI work (the bottom
  drawers, the design-system primitives, 9 new modules) has been seen on a
  real device or simulator; this sandbox has no way to run one. Once you
  have a dev build running, a pass through each module's create/edit flow
  before considering any of it "done" is worth the hour.

## Order-of-operations summary

If you want the shortest path to "the app boots and I can click around,"
minimum viable order is: **Supabase project → migrations → `.env` with just
the Supabase values → `npm run ios`.** Everything else (Google, RevenueCat,
Anthropic, push, Edge Function deploys) can follow once the app is at least
running — nothing except a Supabase project blocks a first boot.
