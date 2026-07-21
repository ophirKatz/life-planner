# Modular Life Planner — Design & Architecture

> **Status:** v1 spec. This document is the authoritative source of truth for the
> architecture. The companion `CLAUDE_CODE_PROMPT.md` is the execution plan that
> references this file.

---

## 1. Product vision & scope

A cross-platform (iOS-first, Android-supported) mobile life planner where the user
composes their dashboard from a **marketplace of feature modules** (Tasks, Calendar,
People, Habits, Shopping, …). Modules are **first-party only** for now, but the
platform primitives (module registry, per-user install, capability manifests,
cross-module link graph, event bus) are built so that external contribution is a
future extension rather than a rewrite.

Two capabilities are **first-class, cross-cutting infrastructure** (not modules):

1. **Account integrations** — connect external accounts (Google first) so modules can
   sync data (e.g. Google Calendar → Calendar module). Synced records carry an
   optional **account owner** that is **never cascade-deleted**.
2. **Billing & entitlements** — a real paywall (free vs Pro) enforced on both client
   and server, backed by store IAP via RevenueCat.

### In scope (v1)
- Auth (Supabase + Google OAuth), multi-tenant-ready from row zero.
- Module platform: registry, per-user enable/disable, marketplace UI.
- 5 seed modules: **Tasks, Calendar, People, Habits, Shopping**.
- Cross-module relationships via a polymorphic `links` graph (e.g. attach a Person to
  a Task or Calendar event) with defined side-effects.
- Integrations subsystem + **Google Calendar two-way-ready sync** (pull for v1).
- Billing: RevenueCat, Pro entitlement, paywall, server-enforced limits.
- Push notifications (`expo-notifications`), scheduled via `pg_cron` + Edge Function.
- A deliberate, modern design system (NativeWind v4 + React Native Reusables).

### Out of scope (v1) — deliberate non-goals
- Third-party / externally authored modules and any untrusted-code runtime.
- Offline-first / local-first sync (online-only for v1).
- Web app (architecture stays web-portable but no web target shipped).
- Generic JSONB/EAV data store (dropped — see §4).

---

## 2. Tech stack (locked)

| Concern | Choice | Rationale |
|---|---|---|
| App framework | **Expo SDK 54** (managed) + **Expo Router** | Default `create-expo-app` SDK; best library compat; file-based nav. Bump to 57 only if a needed lib requires it. |
| Language | TypeScript (strict) | — |
| Styling | **NativeWind v4** | Tailwind semantics you already know from the web app. |
| Component base | **React Native Reusables** | shadcn-for-mobile; direct port of your Radix/shadcn primitives. |
| Icons | `lucide-react-native` | Same icon set as the web app. |
| Server state | **TanStack Query** | Cache, mutations, optimistic updates against Supabase. |
| Local UI state | **Zustand** | Light, no boilerplate. |
| Forms | `react-hook-form` + `zod` | Typed validation shared client/server. |
| Dates | `date-fns` | Reuse from web app. |
| Charts | `victory-native` (Skia) | `recharts` is web-only — **do not** try to reuse it. |
| Lists | `@shopify/flash-list` | Perf for long lists (tasks, shopping, agenda). |
| Gestures/motion | `react-native-gesture-handler`, `react-native-reanimated`, `moti`, `expo-haptics` | Swipe-to-check, spring transitions, tactile feedback. |
| Backend | **Supabase** (Postgres + RLS + Edge Functions + Realtime + Storage) | Keep it. Ideal for per-user multitenancy; you already run Edge Functions + `pg_cron` + web-push. |
| Auth | Supabase Auth + Google OAuth (PKCE via `expo-auth-session` / `expo-web-browser`) | Session in `expo-secure-store`. |
| Notifications | `expo-notifications` (Expo push tokens) | Replaces the PWA service-worker + web-push stack. |
| Billing | **RevenueCat** (`react-native-purchases` + `react-native-purchases-ui`) | Mandatory store IAP abstraction; prebuilt paywalls; webhook → Supabase. |
| Secrets | Tokens/keys **server-side only** (Edge Functions, service role) | Client only ever holds the anon key. |

### Why Supabase is *not* the weak link
Postgres + RLS is a near-perfect fit for per-user data with a uniform
`auth.uid() = user_id` policy. JSONB + GIN covers the few flexible fields. Edge
Functions (Deno) are the correct sandbox for integration/token logic and cross-module
automations. Its one genuine limitation for a *marketplace* — dynamic per-tenant DDL —
is a thing you explicitly want to avoid anyway. A custom .NET backend would flatter
your DDD skills but cost you RLS/auth/realtime/storage "for free" and slow
time-to-market. **Do not switch backends.**

---

## 3. High-level architecture

```
┌────────────────────────────────────────────────────────────┐
│  Expo App (iOS / Android)                                    │
│                                                              │
│  Expo Router  ──►  Core Platform          ──►  Modules       │
│                    ├─ module registry           ├─ tasks     │
│                    ├─ links graph client        ├─ calendar  │
│                    ├─ integrations client       ├─ people    │
│                    ├─ billing/entitlements       ├─ habits    │
│                    ├─ event bus                  └─ shopping  │
│                    ├─ design system                          │
│                    └─ auth + supabase client                 │
└───────────────┬───────────────────────────┬─────────────────┘
                │ anon key + RLS             │ RevenueCat SDK
                ▼                            ▼
┌────────────────────────────┐   ┌───────────────────────────┐
│ Supabase                   │   │ Apple / Google Stores      │
│  Postgres + RLS            │   │  (IAP)                     │
│  Edge Functions (Deno):    │   └───────────┬───────────────┘
│   • oauth-exchange         │               │ webhook
│   • sync-google-calendar   │◄──────────────┘
│   • google-webhook         │   ┌───────────────────────────┐
│   • revenuecat-webhook     │◄──│ RevenueCat                 │
│   • send-notifications     │   └───────────────────────────┘
│  pg_cron (scheduled sync)  │
│  Vault/pgsodium (tokens)   │──► Google APIs (server-side)
└────────────────────────────┘
```

**Golden rule:** the device never holds OAuth tokens or the service-role key. All
provider API calls are proxied through Edge Functions that load and decrypt tokens
server-side.

---

## 4. Persistence model (relational, first-party)

Because third-party modules are out of scope, the data model is **fully relational** —
real tables, real foreign keys, real constraints. The "marketplace" is a registry over
these tables, not a schemaless store.

### 4.1 Uniform rules (apply to every table)
- Every user-owned table has `user_id uuid not null references auth.users(id)`.
- RLS enabled; policies are `auth.uid() = user_id` for select/insert/update/delete.
- `id uuid primary key default gen_random_uuid()`, `created_at`, `updated_at`
  (trigger-maintained).
- Timestamps are `timestamptz`.

### 4.2 Core platform tables

**`profiles`** — one row per user.
`id` (=auth.uid, PK/FK), `display_name`, `avatar_url`, `timezone`, `created_at`.

**`modules`** — the marketplace catalog (seeded, not user data; readable by all authed
users, writable only via migrations/admin).
`id`, `slug` (unique, e.g. `tasks`), `name`, `description`, `icon`, `tier`
(`free` | `pro`), `is_active`, `version`, `sort_order`.

**`user_modules`** — which modules a user has enabled.
`id`, `user_id`, `module_id` → `modules`, `enabled bool`, `settings jsonb default '{}'`,
`installed_at`. `UNIQUE(user_id, module_id)`.

**`links`** — the polymorphic cross-module relationship graph.
`id`, `user_id`, `from_type text`, `from_id uuid`, `to_type text`, `to_id uuid`,
`rel_type text`, `data jsonb default '{}'`, `created_at`.
`UNIQUE(user_id, from_type, from_id, to_type, to_id, rel_type)`.
- `*_type` is the entity kind (e.g. `person`, `task`, `calendar_event`).
- Polymorphic targets can't use DB-level FKs. Integrity is maintained by:
  - App-layer validation (a registry maps `type → table`).
  - **Cleanup triggers**: when a row in a linkable table is deleted, delete its links
    (both directions). This is how "delete a Person removes its links but keeps the
    tasks/events" is enforced.

**`connected_accounts`** — first-class integrations. See §6.

**`subscriptions`** — entitlement mirror from RevenueCat. See §7.

**`push_tokens`** — `id`, `user_id`, `expo_push_token`, `platform`, `created_at`,
`UNIQUE(user_id, expo_push_token)`.

**`notifications_outbox`** (optional, for scheduled reminders) — `id`, `user_id`,
`title`, `body`, `data jsonb`, `deliver_at timestamptz`, `sent_at timestamptz`.

### 4.3 Shared "syncable record" columns
Any table whose rows can originate from an integration includes:
```
source        text        not null default 'local'   -- 'local' | 'google_calendar' | …
account_id    uuid        null references connected_accounts(id) on delete set null
external_id   text        null                        -- provider's id, for upsert/dedup
external_etag text        null                        -- provider version, for conflict detection
```
Partial unique index for dedup:
`UNIQUE (account_id, external_id) WHERE account_id IS NOT NULL`.

**Disconnect behaviour:** removing a `connected_accounts` row sets `account_id = NULL`
on its records (via `ON DELETE SET NULL`). Records survive as `source` history; a
reconnect can re-adopt them by matching `external_id`.

### 4.4 Module tables

**Tasks** — `tasks`
`title`, `notes`, `status` (`todo`|`doing`|`done`), `priority smallint`,
`due_at timestamptz null`, `completed_at null`, `list_id null` → `task_lists`,
+ syncable columns (Tasks may later sync to Google Tasks).
`task_lists`: `name`, `color`, `is_default`.

**Calendar** — `calendar_events`
`title`, `description`, `location`, `starts_at`, `ends_at`, `all_day bool`,
`rrule text null` (RFC-5545 recurrence), `color`, + syncable columns (this is the
primary Google Calendar sync target).

**People** — `people`
`display_name`, `nickname`, `avatar_url`, `emails text[]`, `phones text[]`,
`birthday date null`, `notes`, + syncable columns (Google Contacts later).

**Habits** — `habits` + `habit_logs`
`habits`: `name`, `description`, `icon`, `color`, `cadence`
(`daily`|`weekly`|`custom`), `target_per_period smallint default 1`,
`schedule jsonb`, `archived_at null`.
`habit_logs`: `habit_id` → `habits`, `date date`, `count smallint default 1`, `note`.
`UNIQUE(user_id, habit_id, date)`. Streaks are computed, not stored.

**Shopping** — `shopping_lists` + `shopping_items`
`shopping_lists`: `name`, `is_default bool`.
`shopping_items`: `list_id` → `shopping_lists`, `name`, `quantity numeric`, `unit`,
`category`, `checked bool default false`, `position int`, `notes`.

### 4.5 Concrete cross-module links (v1)
| From | To | `rel_type` | Meaning / side-effect |
|---|---|---|---|
| person | task | `related` | Person shown on task; task shown on person detail. |
| person | calendar_event | `attendee` | Person listed as attendee. **Auto-created** when a synced event's attendee email matches a Person (server automation). |
| task | calendar_event | `scheduled_as` | A task blocked on the calendar; completing one can resolve the other (see §8). |

---

## 5. Module system (the "marketplace")

### 5.1 Module contract (client)
Each module is a self-contained folder that exports one typed object implementing:

```ts
interface ModuleDefinition {
  slug: string;                       // matches modules.slug
  name: string;
  icon: LucideIcon;
  tier: 'free' | 'pro';
  routes: RouteRegistration[];        // screens registered into Expo Router
  dashboardWidgets: WidgetComponent[];// cards rendered on Home when enabled
  quickAddActions: QuickAddAction[];  // entries in the global "+" sheet
  linkableEntities: LinkableEntity[]; // { type, table, label, resolve(id) } for the links graph
  integrations?: IntegrationUsage[];  // e.g. { provider: 'google', capability: 'calendar' }
  automations?: Automation[];         // event-bus subscribers (see §8)
}
```

- A **module registry** (`core/modules`) imports all definitions and exposes hooks:
  `useEnabledModules()`, `useModuleWidgets()`, `useQuickAddActions()`,
  `resolveLinkable(type, id)`.
- Adding a module = drop a folder + register it + add its migration + seed a `modules`
  row. Nothing else in the platform changes.

### 5.2 Marketplace UX
- **Store screen**: browse all `modules`, each card shows name, description, icon, and
  a **Pro badge** where `tier = 'pro'`. Enable/disable toggles `user_modules.enabled`.
- Enabling a `pro` module (or exceeding free limits) routes through the **paywall**.
- Home dashboard renders `dashboardWidgets` only for enabled modules, in user order.

### 5.3 Folder layout
```
app/                              # Expo Router (thin; delegates to module screens)
  (auth)/                         # login, oauth callback
  (tabs)/                         # home, calendar, add, store, profile
  modules/[slug]/...              # module screens mounted via registry
src/
  core/
    db/          supabase client, query helpers, types (generated)
    auth/        session, google oauth, guards
    modules/     registry, ModuleDefinition, hooks
    links/       link client, resolve(), cleanup helpers
    integrations/ provider client (calls edge fns), account hooks
    billing/     revenuecat init, entitlements, paywall gating
    events/      typed event bus + automation runner
    ui/          design system wrappers over RN Reusables, tokens, theme
    config/      env, constants
  modules/
    tasks/       { definition.ts, screens/, components/, data/, types.ts, automations.ts }
    calendar/    …
    people/      …
    habits/      …
    shopping/    …
supabase/
  migrations/    ordered SQL (schema + RLS + triggers + seed modules)
  functions/     oauth-exchange, sync-google-calendar, google-webhook,
                 revenuecat-webhook, send-notifications
```

---

## 6. Integrations subsystem (first-class)

### 6.1 Data
**`connected_accounts`**
`id`, `user_id`, `provider` (`google`|…), `provider_account_id` (external subject/email),
`email`, `scopes text[]`, `status` (`active`|`expired`|`revoked`),
`access_token_enc`, `refresh_token_enc`, `token_expires_at`, `sync_token`
(provider incremental cursor), `last_synced_at`, `metadata jsonb`, `created_at`.
- Tokens stored **encrypted** (Supabase Vault / pgsodium). Decryptable **only** inside
  `SECURITY DEFINER` functions / Edge Functions using the service role.
- RLS: user reads their own account rows, but **token columns are never exposed to the
  client** (select them out via a view that omits `*_enc`, or column-level protection).

### 6.2 Provider abstraction (server-side, Edge Functions)
```ts
interface SyncProvider {
  authorizeUrl(state, pkce): string;
  exchangeCode(code, pkce): Promise<TokenSet>;
  refresh(refreshToken): Promise<TokenSet>;
  revoke(account): Promise<void>;
  pull(account, sinceToken): Promise<{ records: ProviderRecord[]; nextToken: string }>;
  push?(account, changes): Promise<void>;        // v2 (two-way)
  mapToRows(records): ModuleRow[];               // provider → calendar_events, etc.
}
```
`GoogleCalendarProvider` is the first implementation. Adding "Google Contacts" or
"Microsoft" later = a new implementation, no schema change.

### 6.3 Secure OAuth flow
```
App (expo-auth-session, PKCE)
  → provider consent screen
  → redirect back with authorization code
  → App POSTs { code, verifier } to Edge Function `oauth-exchange`
       ├─ exchanges code for tokens SERVER-SIDE
       ├─ encrypts + stores in connected_accounts
       └─ returns sanitized account (NO tokens)
```
The device never sees access or refresh tokens.

### 6.4 Sync engine (Google Calendar, v1 = pull)
- Edge Function `sync-google-calendar`:
  - Loads + decrypts tokens, refreshes if expired.
  - Incremental pull via Google **sync tokens**; upserts into `calendar_events`
    (`source='google_calendar'`, `account_id`, `external_id`, `external_etag`).
  - Persists new `sync_token` + `last_synced_at`.
- Scheduling: `pg_cron` runs sync every N minutes per `active` account. Optional Google
  **push channels** → `google-webhook` Edge Function for near-realtime.
- Side-effect automation (see §8): after upsert, match attendee emails to `people`
  rows and auto-create `person → calendar_event : attendee` links.

### 6.5 Disconnect
User disconnects → `status='revoked'`, provider `revoke()`, tokens wiped, and (via
`ON DELETE SET NULL` or an explicit update) `account_id → NULL` on owned records.
**Records are kept**, never cascade-deleted. Reconnect re-adopts by `external_id`.

---

## 7. Billing & paywall

### 7.1 Reality check
iOS and Android **require** their native IAP for digital subscriptions (15–30% fee).
You cannot bill digital access via Stripe inside the app. **RevenueCat** wraps
StoreKit + Play Billing behind one API and gives prebuilt paywall UI. Stripe only
appears if you later add **web** billing (RevenueCat Web Billing), sharing the same
entitlement.

**Israel note (developer is Israel-based):** RevenueCat is *not* a payment processor —
it works in every country the app stores support, and Israel is fully supported by both
the App Store and Google Play, which pay out to an Israeli bank account. So the mobile
IAP path has **no Israeli-payments dependency and needs no Stripe**. The only Israel
constraint is that RevenueCat **Web Billing** requires a Stripe-supported *business*
country (Israel is not one) — this affects **only** the deferred web-billing path, not
this app. Do **not** use Israeli gateways (Hyp, Tranzila, Cardcom, etc.) for in-app
subscriptions: Apple/Google prohibit external processors for in-app digital goods and
will reject the app. If a web subscription surface is ever added, evaluate a
Merchant-of-Record (e.g. Paddle) rather than a local gateway or Stripe.

### 7.2 Mechanics
- SDKs: `react-native-purchases` (+ `react-native-purchases-ui` for paywall).
  **Requires a development build** (not Expo Go; Expo Go runs Preview API mode only).
- Configure with platform keys (`EXPO_PUBLIC_REVENUECAT_IOS_KEY` /
  `_ANDROID_KEY`). Entitlement id: **`pro`**. Offering: `default` with Monthly +
  Annual packages.
- **Server truth:** RevenueCat webhook → Edge Function `revenuecat-webhook` → upsert
  **`subscriptions`** (`user_id`, `rc_customer_id`, `is_pro bool`,
  `active_entitlements text[]`, `current_period_end`, `updated_at`). RLS: user reads
  own row.
- **Client** reads the RC SDK for instant UX; **server** enforces hard limits against
  `subscriptions`.

### 7.3 Gating strategy (free vs Pro)
| Limit | Free | Pro |
|---|---|---|
| Enabled modules | 3 | unlimited |
| Connected accounts | 1 | unlimited |
| `pro`-tier modules | locked | unlocked |
| Sync frequency | standard | (optional) higher |
| History / analytics | basic | full |

- **Enforce on server**, not just UI: RLS policies (or `SECURITY DEFINER` guard
  functions) that reject a 4th `user_modules.enabled=true` or a 2nd
  `connected_accounts` unless `subscriptions.is_pro`. UI hides/locks for UX; the DB is
  the backstop.
- **Paywall triggers:** enabling a locked module, exceeding a limit, opening a Pro
  feature. Use RevenueCat's paywall component, themed to match the design system.

---

## 8. Cross-module side-effects (event bus)

Keep it small and typed for v1 — not a rules engine.

- **Client event bus** (`core/events`): modules emit typed events
  (`record.created`, `record.updated`, `record.deleted`, `link.created`,
  `habit.completed`, …). Automations declared in a module's `definition.automations`
  subscribe.
- **Server automations** (DB triggers / Edge Functions) for anything integration-driven
  or that must run regardless of which device is online:
  1. **Attendee → Person auto-link** after Google sync (server).
  2. **Person delete → link cleanup** trigger (server) — keeps tasks/events.
  3. **Habit completion → streak recompute + confetti + haptic** (client).
  4. **`task ↔ calendar_event : scheduled_as`** — completing the task offers to
     resolve/remove the linked event (client, with confirm). *Ship as the example that
     proves the pattern; keep the interaction explicit rather than magical.*

---

## 9. Design system & UX

**Aesthetic direction:** "calm productivity." Restrained, modern, generous whitespace,
one confident accent, rounded-2xl cards, soft shadows, large legible type, tabular
numerals for stats and streaks. Dark mode is a first-class citizen from day one, not a
retrofit.

- **Foundation:** NativeWind v4 tokens (color, spacing, radius, type scale) defined
  once in `core/ui/theme`. Light + dark palettes. Semantic tokens
  (`bg`, `surface`, `muted`, `accent`, `danger`, `success`).
- **Components:** React Native Reusables primitives (Button, Card, Sheet, Dialog,
  Tabs, Checkbox, Select, Input) wrapped in `core/ui` so modules never import the raw
  lib directly (keeps restyle/replacement cheap).
- **Motion:** `reanimated` + `moti` spring transitions; `expo-haptics` on completion
  actions; `canvas-confetti`-equivalent (`react-native-confetti` / Skia) on habit/task
  completion.
- **States:** every list/screen ships **empty**, **loading (skeleton)**, and **error**
  states. No blank screens.
- **Navigation:** bottom tabs — **Home** (dashboard widgets), **Calendar**, **＋**
  (global quick-add sheet, aggregates module `quickAddActions`), **Store**
  (marketplace), **Profile** (account, integrations, subscription, settings).

### Key screens
Onboarding + Google sign-in · Home dashboard (module widgets) · Module Store (Pro
badges) · Tasks (list + detail + quick-add) · Calendar (month + agenda) · People (list
+ detail with linked items) · Habits (grid + streak rings) · Shopping (checkable,
swipe-to-remove, categories) · Integrations / Connected accounts · Paywall · Settings.

---

## 10. Security model (summary)
- RLS on every user table (`auth.uid() = user_id`); default-deny.
- Client holds **only** the anon key. Service role lives in Edge Functions.
- OAuth tokens: encrypted at rest, decrypted only server-side, never sent to the
  device; a token-free view/DTO is what the client reads.
- All provider API calls proxied through Edge Functions.
- Paywall limits enforced in the DB, not just the UI.
- Polymorphic `links` integrity via app-layer type registry + delete-cleanup triggers.
- Input validation with `zod` on the client and check constraints / triggers on the DB.

---

## 11. Build phases (maps to the Claude Code milestones)
- **M0** Scaffold: Expo + Router + NativeWind + RN Reusables + Supabase client + Google auth.
- **M1** Core platform: DB schema, RLS, module registry, `links` graph, seed `modules`.
- **M2** Design system: tokens, theme, wrapped components, navigation shell, empty/loading/error.
- **M3** Modules: Tasks, Calendar, People, Habits, Shopping (CRUD + widgets + quick-add).
- **M4** Links + dashboard: person↔task/event linking, Home widgets, global quick-add.
- **M5** Integrations: `connected_accounts`, OAuth-exchange fn, Google Calendar pull, `pg_cron`, attendee auto-link.
- **M6** Billing: RevenueCat, `subscriptions` mirror, paywall, server-enforced limits.
- **M7** Notifications: `expo-notifications`, `push_tokens`, reminder scheduling.
- **M8** Polish: motion, haptics, accessibility, dark mode QA, empty-state art.

---

## 12. Deferred design hooks (so v2 isn't a rewrite)
- **Third-party modules:** the `ModuleDefinition` contract and the `links`/event-bus
  boundaries are the future extension point. A future declarative module would ship a
  JSON manifest interpreted by the same registry, and its automations would run
  server-side only. Nothing in v1 blocks this.
- **Two-way sync:** `SyncProvider.push` is stubbed; the syncable-columns model already
  carries `external_etag` for conflict detection.
- **Web billing:** RevenueCat Web Billing + Stripe can be added with the same `pro`
  entitlement.
