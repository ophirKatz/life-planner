-- M1: core platform schema — module marketplace, per-user installs, the
-- polymorphic links graph, integrations, billing, and notifications scaffolding.
-- See DESIGN.md §4.2 for the authoritative table descriptions.

-- ---------------------------------------------------------------------------
-- modules: the marketplace catalog. Seeded by this migration, not user data.
-- Readable by any authenticated user; writable only via migrations (no
-- insert/update/delete policies at all — default-deny covers writes).
-- ---------------------------------------------------------------------------
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  icon text not null,
  tier text not null check (tier in ('free', 'pro')),
  is_active boolean not null default true,
  version text not null default '1.0.0',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.modules enable row level security;

create policy "modules_select_authenticated" on public.modules
  for select using (auth.role() = 'authenticated');

create trigger modules_set_updated_at
  before update on public.modules
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- user_modules: per-user enable/disable. Absence of a row (or enabled=false)
-- means the module's widgets/screens/quick-add actions are hidden.
-- ---------------------------------------------------------------------------
create table public.user_modules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_id uuid not null references public.modules (id) on delete cascade,
  enabled boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  installed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, module_id)
);

alter table public.user_modules enable row level security;

create policy "user_modules_all_own" on public.user_modules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger user_modules_set_updated_at
  before update on public.user_modules
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- links: the polymorphic cross-module relationship graph (DESIGN.md §4.5).
-- Integrity for from_type/to_type is enforced app-side by a type->table
-- registry (src/core/links/registry.ts), not DB foreign keys (impossible for
-- a polymorphic target). Delete-cleanup is a reusable trigger function,
-- attached to each linkable module table as it's created (M3/M4).
-- ---------------------------------------------------------------------------
create table public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  from_type text not null,
  from_id uuid not null,
  to_type text not null,
  to_id uuid not null,
  rel_type text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, from_type, from_id, to_type, to_id, rel_type)
);

alter table public.links enable row level security;

create policy "links_all_own" on public.links
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger links_set_updated_at
  before update on public.links
  for each row execute function public.set_updated_at();

create index links_from_idx on public.links (user_id, from_type, from_id);
create index links_to_idx on public.links (user_id, to_type, to_id);

-- Attach this to every linkable module table, e.g.:
--   create trigger people_cleanup_links after delete on public.people
--     for each row execute function public.cleanup_links_on_delete('person');
create or replace function public.cleanup_links_on_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  entity_type text := TG_ARGV[0];
begin
  delete from public.links
  where (from_type = entity_type and from_id = old.id)
     or (to_type = entity_type and to_id = old.id);
  return old;
end;
$$;

-- ---------------------------------------------------------------------------
-- connected_accounts: first-class integrations (DESIGN.md §6). Token columns
-- are encrypted at rest and locked down at the column-grant level; the client
-- reads connected_accounts_safe, never the base table.
-- ---------------------------------------------------------------------------
create table public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('google')),
  provider_account_id text not null,
  email text,
  scopes text[] not null default '{}'::text[],
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  access_token_enc bytea,
  refresh_token_enc bytea,
  token_expires_at timestamptz,
  sync_token text,
  last_synced_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider, provider_account_id)
);

alter table public.connected_accounts enable row level security;

-- Users may read (a token-free view of) and disconnect their own accounts.
-- Inserts/updates that touch token columns only ever happen server-side via
-- the service role (Edge Functions), which bypasses RLS entirely.
create policy "connected_accounts_select_own" on public.connected_accounts
  for select using (auth.uid() = user_id);

create policy "connected_accounts_delete_own" on public.connected_accounts
  for delete using (auth.uid() = user_id);

create trigger connected_accounts_set_updated_at
  before update on public.connected_accounts
  for each row execute function public.set_updated_at();

-- Belt-and-suspenders: even though the view below omits them, make the raw
-- token columns unreadable to anon/authenticated at the column-grant level.
revoke select (access_token_enc, refresh_token_enc) on public.connected_accounts
  from anon, authenticated;

create view public.connected_accounts_safe
  with (security_invoker = true) as
select
  id,
  user_id,
  provider,
  provider_account_id,
  email,
  scopes,
  status,
  token_expires_at,
  last_synced_at,
  metadata,
  created_at,
  updated_at
from public.connected_accounts
where user_id = auth.uid();

grant select on public.connected_accounts_safe to authenticated;

-- ---------------------------------------------------------------------------
-- subscriptions: entitlement mirror from RevenueCat (DESIGN.md §7). Only the
-- revenuecat-webhook Edge Function (service role) writes to this table.
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  rc_customer_id text,
  is_pro boolean not null default false,
  active_entitlements text[] not null default '{}'::text[],
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- push_tokens
-- ---------------------------------------------------------------------------
create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  expo_push_token text not null,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

alter table public.push_tokens enable row level security;

create policy "push_tokens_all_own" on public.push_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger push_tokens_set_updated_at
  before update on public.push_tokens
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- notifications_outbox: scheduled reminders (habit/task/event), delivered by
-- the send-notifications Edge Function on a pg_cron schedule (M7).
-- ---------------------------------------------------------------------------
create table public.notifications_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  deliver_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notifications_outbox enable row level security;

create policy "notifications_outbox_all_own" on public.notifications_outbox
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger notifications_outbox_set_updated_at
  before update on public.notifications_outbox
  for each row execute function public.set_updated_at();

create index notifications_outbox_due_idx on public.notifications_outbox (deliver_at)
  where sent_at is null;

-- ---------------------------------------------------------------------------
-- Extend the M0 new-user trigger to also seed a subscriptions row, so every
-- user has one from the moment they sign up (simplifies M6's free-limit
-- checks — no "no row yet" case to special-case).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, timezone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(new.raw_user_meta_data ->> 'timezone', 'UTC')
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, is_pro)
  values (new.id, false)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Seed the marketplace catalog: 5 free modules + 1 pro placeholder
-- ("insights") that proves tier-gating end to end (DESIGN.md decision log).
-- ---------------------------------------------------------------------------
insert into public.modules (slug, name, description, icon, tier, sort_order) values
  ('tasks', 'Tasks', 'Lists, priorities, and due dates.', 'list-todo', 'free', 10),
  ('calendar', 'Calendar', 'Month and agenda views, synced with Google Calendar.', 'calendar', 'free', 20),
  ('people', 'People', 'Contacts linked to your tasks and events.', 'users', 'free', 30),
  ('habits', 'Habits', 'Daily check-ins and streaks.', 'flame', 'free', 40),
  ('shopping', 'Shopping', 'Checkable lists with categories.', 'shopping-cart', 'free', 50),
  ('insights', 'Insights', 'Advanced analytics across your modules.', 'sparkles', 'pro', 60);
