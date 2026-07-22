# CLAUDE.md

Orientation for AI agents working in this repo. Read this first; it links out
to fuller docs rather than repeating them.

## What this is

A cross-platform (iOS-first) Expo life-planner. Users compose their Home
dashboard from a marketplace of first-party feature modules. Google Calendar
sync and RevenueCat billing are cross-cutting infrastructure. Fully relational
Supabase backend (Postgres + RLS + Edge Functions), multi-tenant and
paywalled from day one.

- **Full architecture spec:** [`DESIGN.md`](./DESIGN.md) — the authoritative
  reference for schema, the module contract, links graph, billing, and more.
  When in doubt, this file wins.
- **Setup, env vars, OAuth/RevenueCat config, "adding a module" walkthrough:**
  [`README.md`](./README.md).
- **Original milestone-by-milestone build plan** (historical, useful for
  *why* things are shaped this way): [`CLAUDE_CODE_PROMPT.md`](./CLAUDE_CODE_PROMPT.md).

## Stack

Expo SDK 54 + Expo Router + TypeScript (strict) · NativeWind v4 + React
Native Reusables · TanStack Query + Zustand · react-hook-form + zod ·
`@shopify/flash-list` · Supabase (Postgres + RLS + Edge Functions +
`pg_cron`) · RevenueCat · `expo-notifications`. Full list in
[`README.md`](./README.md#stack).

## Repository map

```
app/                    Expo Router — thin, delegates to src/modules screens
src/core/               Platform: db client, auth, modules registry, links
                         graph, billing/paywall, events bus, design system
                         (core/ui), notifications, integrations
src/modules/<slug>/     One folder per module: types.ts, data/, screens/,
                         components/, definition.ts, (linkable.ts,
                         automations.ts)
supabase/migrations/    Ordered, numbered, additive — never edit a shipped one
supabase/functions/     Deno Edge Functions, one folder per function
docs/                   Topic guides — see below
```

## Modules and tiers

Free tier: **Tasks, Calendar, People, Shopping**. Every other module is
`pro`-tier, gated per DESIGN.md §7.3 (habits, ideas, wishlists, focus,
recipes, climbing, weather, budget, workouts, travel). Some pro *features*
live inside free modules too (e.g. People's AI relationship summary) — those
are gated where the feature is invoked, not at the module level.

`modules.is_active` is a separate, non-billing kill switch a developer can
flip to hide a module app-wide, independent of tier — see
`src/core/modules/hooks.ts`.

## Admin dashboard

`profiles.is_admin` (DESIGN.md §7.4) gates a `/admin` screen (linked from
Profile, admins only) that toggles `modules.tier`/`is_active` and generic
`feature_flags` rows — the same levers above, editable at runtime instead of
via migration. Enforcement is two RLS policies calling `public.is_admin()`,
not the screen; there's no seed admin, promotion is a manual SQL step (see
`docs/setup-guide.md`).

## Non-negotiable rules

- **RLS on every user-owned table**, default-deny, `auth.uid() = user_id`
  policies. Paywall limits are enforced in the DB (triggers), not only the UI.
- **Modules never import each other's internals.** Cross-cutting composition
  (Home dashboard, quick-add, Today section) lives in `src/core/`, never in
  another module's folder. Cross-module *data* relationships go through the
  polymorphic `links` table, not direct FKs.
- **No raw fetch/Supabase calls from screens or components.** All data access
  goes through a module's `data/*.ts` TanStack Query hooks.
- **No unwrapped UI primitives.** Use `src/core/ui/*`, never RN Reusables or
  raw React Native components directly for anything already wrapped — see
  [`docs/design-system.md`](./docs/design-system.md).
- **All external provider calls (Google, Anthropic, weather, RevenueCat
  webhooks) go through Edge Functions.** The client never sees a third-party
  API key or an OAuth token — see [`docs/edge-functions.md`](./docs/edge-functions.md).
- Adding a module must never require touching existing platform code —
  folder + registry entry + migration + seed row, full stop (README.md
  walks through this).

## Commands

```sh
npm run typecheck    # app + Edge Functions are separate TS projects — see tsconfig excludes
npm run lint
npm run db:types     # regenerate src/core/db/types.ts after any migration
npm run ios          # or: npm run android
```

RevenueCat and push notifications need a dev build, not Expo Go — see
[`README.md`](./README.md#-dev-build-required-for-revenuecat-and-push-notifications).

## Further reading

- [`docs/design-system.md`](./docs/design-system.md) — the `core/ui`
  component inventory, theming, and form/list/modal conventions.
- [`docs/best-practices.md`](./docs/best-practices.md) — data-hook patterns,
  naming, gating a new pro feature, the pre-commit checklist.
- [`docs/edge-functions.md`](./docs/edge-functions.md) — Edge Function
  structure, auth pattern, current function inventory, local dev and deploy.
