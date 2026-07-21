-- M0: minimal schema needed for auth to satisfy "Google sign-in creates a session
-- and a profiles row". The rest of the core platform schema (modules, user_modules,
-- links, connected_accounts, subscriptions, push_tokens, notifications_outbox) is
-- added in migration 0002+ (M1), per DESIGN.md §4.2.

-- Generic updated_at trigger, reused by every table in this project.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- No insert/delete policies: rows are created only by the trigger below
-- (SECURITY DEFINER, running as the table owner) and deleted only via the
-- auth.users cascade. This keeps profile creation out of client hands.

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row the moment a new auth user is created (Google
-- OAuth sign-in included), so "authed users land on an empty Home" never
-- races against a client-side insert.
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
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
