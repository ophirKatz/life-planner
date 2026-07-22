-- Admin control plane (DESIGN.md §5.2 / §7.3 extension): a single-purpose
-- `profiles.is_admin` flag, a security-definer helper to check it without
-- RLS recursion, admin-only write access to the `modules` catalog (tier +
-- is_active), and a generic `feature_flags` table for cross-cutting kill
-- switches that aren't tied to a specific module (e.g. AI features that
-- live inside a free module). The admin dashboard UI is the only client of
-- these writes; everything else about gating (paywall triggers, is_active
-- checks) is unchanged.

alter table public.profiles add column is_admin boolean not null default false;

-- profiles_update_own (migration 0001) has no WITH CHECK, so it defaults to
-- reusing its USING clause — meaning without this, any authenticated user
-- could self-promote via `update profiles set is_admin = true where id =
-- auth.uid()`. Column-level revoke closes that regardless of RLS policy
-- wording (same technique as connected_accounts' token columns, M1):
-- is_admin can only be flipped by a role that bypasses grants entirely
-- (the SQL editor's postgres role), never by anon/authenticated.
revoke update (is_admin) on public.profiles from anon, authenticated;

-- security definer + a fixed search_path so this can be called from any RLS
-- policy (including on profiles itself) without recursing into profiles'
-- own row-level policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- modules: admins can update the catalog (is_active kill switch, tier)
-- directly from the client. Still default-deny for insert/delete — new
-- modules are still shipped via migration + seed row, not the admin UI.
-- ---------------------------------------------------------------------------
create policy "modules_update_admin" on public.modules
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- feature_flags: generic on/off switches not tied to a module row. Seeded
-- with the two existing AI features, which already check subscriptions.is_pro
-- per-user but had no global kill switch. Any future cross-cutting feature
-- gets a row here instead of a schema change.
-- ---------------------------------------------------------------------------
create table public.feature_flags (
  key text primary key,
  name text not null,
  description text not null,
  category text not null default 'general',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.feature_flags enable row level security;

create policy "feature_flags_select_authenticated" on public.feature_flags
  for select using (auth.role() = 'authenticated');

create policy "feature_flags_update_admin" on public.feature_flags
  for update using (public.is_admin()) with check (public.is_admin());

create trigger feature_flags_set_updated_at
  before update on public.feature_flags
  for each row execute function public.set_updated_at();

insert into public.feature_flags (key, name, description, category) values
  ('ai_people_summary', 'People AI summaries',
   'AI relationship-summary generation in the People module. Independent of subscription status — off means no one gets it, pro or not.',
   'ai'),
  ('ai_focus_summary', 'Focus AI digest',
   'AI daily/weekly digest generation in the Focus module.',
   'ai');

-- Bootstrap: no admin exists yet at migration time (this project has no seed
-- user). Promote yourself manually after signing up — see docs/setup-guide.md:
--   update public.profiles set is_admin = true where id = auth.uid();
