# Claude Code Build Prompt — Modular Life Planner

You are building a production, multi-tenant mobile app from scratch. `DESIGN.md` in the repo root is the authoritative specification. Read it fully before writing code. This file is your execution plan: constraints, order, and acceptance criteria. When this file and `DESIGN.md` disagree, `DESIGN.md` wins; ask before diverging from either.

## Mission
A cross-platform (iOS-first) Expo life-planner where users compose a dashboard from a marketplace of first-party feature modules (Tasks, Calendar, People, Habits, Shopping). Account integrations (Google Calendar sync) and billing (RevenueCat paywall) are first-class, cross-cutting infrastructure. Fully relational Supabase backend. Multi-tenant and paywalled from day one.

## Non-negotiable constraints

### Stack (do not substitute without asking)
- Expo SDK 54 (managed) + Expo Router + TypeScript (strict).
- NativeWind v4 + React Native Reusables for all UI. Wrap primitives in `src/core/ui/*`; modules must not import the raw library directly.
- TanStack Query (server state) + Zustand (local UI state).
- `react-hook-form` + `zod`. `date-fns`. `@shopify/flash-list`.
- `victory-native` for charts. Never use `recharts` (web-only).
- `react-native-gesture-handler`, `react-native-reanimated`, `moti`, `expo-haptics`.
- Supabase (`@supabase/supabase-js`) + `expo-secure-store` session storage.
- Google OAuth via `expo-auth-session` + `expo-web-browser` (PKCE).
- `expo-notifications` for push.
- RevenueCat: `react-native-purchases` + `react-native-purchases-ui`.
- Icons: `lucide-react-native`.

### Security (hard rules — violating these is a bug)
- Enable RLS on every user-owned table; default-deny; policies `auth.uid() = user_id`.
- The client holds only the Supabase anon key. The service-role key and all OAuth tokens live server-side only, inside Edge Functions.
- OAuth access/refresh tokens are encrypted at rest and never returned to the device. The client reads a token-free view/DTO of `connected_accounts`.
- All external provider API calls go through Edge Functions, never direct from the app.
- Paywall limits are enforced in the database (RLS / `SECURITY DEFINER` guards), not only in the UI.

### Architecture
- Fully relational schema (no generic JSONB/EAV store). Real tables, FKs, constraints.
- Implement the `ModuleDefinition` contract from `DESIGN.md §5.1`. Adding a module = new folder + registry entry + migration + seed `modules` row, with zero changes to platform code.
- Cross-module relationships go through the polymorphic `links` table (`DESIGN.md §4.2, §4.5`) with delete-cleanup triggers.
- Syncable records carry `source`, `account_id` (FK `ON DELETE SET NULL`), `external_id`, `external_etag` (`DESIGN.md §4.3`). Never cascade-delete records on account disconnect.

### Do NOT (out of scope for v1)
- No third-party / externally authored modules and no untrusted-code runtime. (But keep the `ModuleDefinition` boundary clean so it's a future extension.)
- No offline-first / local-first sync. Online-only.
- No web target.
- No secrets in `AsyncStorage`, in the client bundle, or in `EXPO_PUBLIC_*` beyond publishable keys.

## Environment variables
Client (`EXPO_PUBLIC_*`, safe to ship): `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_REVENUECAT_IOS_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`.
Server (Edge Function secrets, never shipped): `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `TOKEN_ENCRYPTION_KEY` (or Vault), `REVENUECAT_WEBHOOK_SECRET`, `EXPO_ACCESS_TOKEN` (push).
Create a `.env.example` documenting all of them. Never commit real values.

## Folder structure
Follow `DESIGN.md §5.3` exactly (`app/` router thin, `src/core/*`, `src/modules/*`, `supabase/{migrations,functions}`).

## Build order (milestones)
Work milestone by milestone. After each, produce the stated artifacts and a short self-check against the acceptance criteria. Do not start a milestone before the prior one's criteria pass. Keep migrations ordered and idempotent.

- **M0** — Scaffold & auth: `create-expo-app` (SDK 54, TS, Expo Router), NativeWind v4, RN Reusables, Supabase client with `expo-secure-store` session, Google OAuth (PKCE). Accept: app boots on iOS simulator; unauthenticated users see Login; Google sign-in creates a session and a `profiles` row; authed users land on an empty Home.
- **M1** — Core platform & schema: migrations for all core tables with RLS + triggers; seed 5 `modules` rows + 1 `pro` placeholder (`insights`); `src/core/modules` registry; `src/core/links` client; generated DB types. Accept: RLS verified; registry lists seeded modules; a link can be created and resolved.
- **M2** — Design system & shell: theme tokens, wrapped components, bottom-tab shell, global quick-add sheet. Accept: dark/light toggle works; every screen has empty/loading/error states; tabs navigate; quick-add sheet opens.
- **M3** — Seed modules: Tasks, Calendar, People, Habits, Shopping, each a self-contained `ModuleDefinition`. Accept: each module has full CRUD against Supabase with RLS; renders a dashboard widget; registers a quick-add action; enable/disable via `user_modules` shows/hides its widget and screens.
- **M4** — Cross-module links & dashboard: person↔task/event/`scheduled_as` links; Home dashboard composition; event bus + automations. Accept: linking a Person to a Task is bidirectionally visible; deleting a Person removes its links but leaves tasks/events intact; dashboard reflects enabled modules.
- **M5** — Integrations (Google Calendar): token-free `connected_accounts` view; Edge Functions `oauth-exchange`, `sync-google-calendar`, `google-webhook`; `pg_cron` schedule; Connect/disconnect UI; attendee auto-link. Accept: connecting Google imports events tagged with `source`/`account_id`; tokens never appear client-side; disconnect keeps events; attendee auto-link fires.
- **M6** — Billing & paywall: RevenueCat init, `pro` entitlement, paywall UI; `revenuecat-webhook` → `subscriptions`; DB-enforced free limits. Accept: free user hitting a limit sees the paywall; sandbox purchase flips `is_pro`; DB rejects gated action for non-Pro even if UI bypassed.
- **M7** — Notifications: push token registration, `notifications_outbox` + `pg_cron` + `send-notifications` Edge Function. Accept: a scheduled reminder delivers a push on a dev build; tokens per-user and RLS-protected.
- **M8** — Polish: motion, haptics, accessibility, dark-mode QA, empty-state visuals, error boundaries. Accept: no blank/janky screens; VoiceOver reads key controls; dark and light both clean.

## Coding standards
- TypeScript strict; no `any` in committed code. Zod-validate all external input.
- Data access only through module `data/` hooks (TanStack Query); no ad-hoc Supabase calls in components.
- Every migration includes its RLS policies and is reversible/idempotent where possible.
- Small, composable components; wrapped design-system primitives only.
- Write a minimal test per milestone proving the acceptance criterion (RLS isolation, link cleanup, paywall DB enforcement).
- Conventional commits; one milestone ≈ one reviewable PR-sized change set.

## Deliverables
Working Expo app + `supabase/migrations` + `supabase/functions` + `.env.example` + seeded modules + a `README` documenting setup, the dev-build requirement for RevenueCat/notifications, and how to add a new module (the contract).

## Ask-before-proceeding checklist
Confirm with the human before: choosing which module is the seeded `pro` example; adding any dependency not listed above; bumping Expo SDK beyond 54; any deviation from `DESIGN.md`.

---

## Decisions confirmed with the human (2026-07-21)
- Pro-tier seed module: placeholder `insights` module (all 5 core modules — Tasks, Calendar, People, Habits, Shopping — are `free`).
- Supabase project: Claude creates and manages a real Supabase project via MCP tools; all schema still lives as ordered migrations in `supabase/migrations` in this repo (source of truth), applied to that project.
- Google OAuth / RevenueCat credentials: build the full integration against env vars now; ship `.env.example` with placeholders; real credentials to be supplied later before those features go live.
