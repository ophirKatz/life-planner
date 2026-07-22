# Best practices

Conventions for writing code in this repo, beyond what `README.md`'s
"Adding a new module" walkthrough already covers.

## Data hooks (`src/modules/<slug>/data/*.ts`)

- One file per resource, one `useX`/`useCreateX`/`useUpdateX`/`useDeleteX`
  set of hooks. Screens and components call these — never `supabase.from(...)`
  directly.
- Query key convention: `export const xKey = ["x"] as const;` for a list,
  `export const xKey = (id: string) => ["x", id] as const;` for a single
  record. Mutations invalidate the list key always, and the single-record key
  too when updating.
- `useCreateX` takes `Omit<XInsert, "user_id">` and reads the current user
  via `supabase.auth.getUser()` itself — callers never pass `user_id`.
- A query scoped to "this month" / "this period" takes the reference date as
  a parameter (default `new Date()`) and folds it into the query key, so
  different periods don't collide in the cache — see
  `src/modules/budget/data/useTransactions.ts`.

## Naming and structure

- `types.ts` re-exports `Tables<"x">`/`TablesInsert<"x">`/`TablesUpdate<"x">`
  from `core/db/types.ts` under module-local names (`XRow`, `XInsert`,
  `XUpdate`) — components import from the module's `types.ts`, never
  `core/db/types` directly.
- `screens/` components take plain props (an `id: string`, nothing
  route-specific) and know nothing about Expo Router internals beyond
  `useRouter()`/`useLocalSearchParams()`. The `app/modules/<slug>/*.tsx`
  route files are a thin `<Stack.Screen options={...} /><TheScreen /></>`
  wrapper — put no logic there.
- Free-text list fields (recipe ingredients, workout exercises) are stored as
  `text[]`, one entry per line, parsed from/to a multiline `Input` with a
  small `parseLines`/`join("\n")` pair in the screen. Don't build a dynamic
  field-array UI for this — it's not used anywhere in the app.
- A module with no natural "list" (Weather, Focus) still gets a `screens/`
  folder and a `routes` entry; it just doesn't need `data/useX.ts` CRUD hooks
  the way a resource module does.

## Gating a new pro feature

Two shapes, per DESIGN.md §7.3 — pick based on what's being gated:

- **Whole module is pro:** set `tier: "pro"` in both the module's
  `definition.ts` and its catalog seed row. The platform (Store, `enforce_module_limits`
  trigger, `useEnabledModules`) handles the rest — no per-screen checks needed.
- **One feature inside an otherwise-free module** (e.g. an AI summary): check
  `subscriptions.is_pro` **inside the Edge Function** that does the gated
  work (see `summarize-person-interactions`), not in a DB trigger — this
  isn't a row-insert the module-limits trigger covers, it's a
  generate-on-demand action. On the client, still show the feature (as a
  locked card with an upgrade prompt) rather than hiding it — see
  `PersonSummaryCard` for the pattern: `useSubscription()` for the
  client-side hint, `isPaywallError()` + `presentPaywall()` when the Edge
  Function rejects the call.

## Before committing

1. `npm run typecheck && npm run lint` — both must be clean. The app and Edge
   Functions are separate TypeScript projects; typecheck only covers the app
   (Deno functions aren't type-checked by this command).
2. New/changed tables: add or update the RLS policy and `updated_at` trigger
   in the same migration, and hand-edit the corresponding block in
   `src/core/db/types.ts` to match — there's no live Supabase project to run
   `supabase gen types` against in most agent sessions, so the generated
   types file has to be kept in sync by hand. Match the exact `Row`/`Insert`/`Update`/`Relationships`
   shape of a neighboring table and keep the file's alphabetical table order.
3. New migrations are additive and numbered next in sequence
   (`00NN_description.sql`) — never edit a migration that's already shipped,
   even to fix a typo in a comment.
4. If you added a module, confirm all five wiring points from README's
   "Adding a new module" are done: migration + seed row, `data/`, `screens/`
   + `app/modules/<slug>/*` routes, `definition.ts`, and the
   `registerModule()` entry in `src/modules/index.ts`.
