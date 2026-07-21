-- M3: Calendar module. Primary Google Calendar sync target (M5).

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  rrule text,
  color text not null default '#6366f1',
  -- syncable-record columns (DESIGN.md §4.3)
  source text not null default 'local',
  account_id uuid references public.connected_accounts (id) on delete set null,
  external_id text,
  external_etag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at >= starts_at)
);

alter table public.calendar_events enable row level security;

create policy "calendar_events_all_own" on public.calendar_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger calendar_events_set_updated_at
  before update on public.calendar_events
  for each row execute function public.set_updated_at();

create unique index calendar_events_account_external_id_idx
  on public.calendar_events (account_id, external_id)
  where account_id is not null;

create index calendar_events_user_starts_at_idx on public.calendar_events (user_id, starts_at);

-- Linkable entity "calendar_event": person<->event "attendee", task<->event "scheduled_as".
create trigger calendar_events_cleanup_links
  after delete on public.calendar_events
  for each row execute function public.cleanup_links_on_delete('calendar_event');
