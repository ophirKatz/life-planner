-- M3: People module.

create table public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null,
  nickname text,
  avatar_url text,
  emails text[] not null default '{}'::text[],
  phones text[] not null default '{}'::text[],
  birthday date,
  notes text,
  -- syncable-record columns (DESIGN.md §4.3) — Google Contacts later.
  source text not null default 'local',
  account_id uuid references public.connected_accounts (id) on delete set null,
  external_id text,
  external_etag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.people enable row level security;

create policy "people_all_own" on public.people
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger people_set_updated_at
  before update on public.people
  for each row execute function public.set_updated_at();

create unique index people_account_external_id_idx on public.people (account_id, external_id)
  where account_id is not null;

create index people_user_display_name_idx on public.people (user_id, display_name);

-- Linkable entity "person": person<->task "related", person<->event "attendee".
create trigger people_cleanup_links
  after delete on public.people
  for each row execute function public.cleanup_links_on_delete('person');
