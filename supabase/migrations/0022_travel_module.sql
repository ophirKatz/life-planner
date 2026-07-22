-- Travel Planner module (pro tier, DESIGN.md §7.3). Itinerary, packing
-- list, and documents/notes are unified under one trip_items table
-- (differentiated by `type`) rather than three separate tables — they share
-- the same shape (title + optional details + done, done only meaningful for
-- packing) and always belong to exactly one trip. Linkable to People, for
-- travel companions.

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  destination text,
  start_date date not null,
  end_date date not null,
  notes text,
  color text not null default '#6366f1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trips enable row level security;

create policy "trips_all_own" on public.trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger trips_set_updated_at
  before update on public.trips
  for each row execute function public.set_updated_at();

create index trips_user_start_date_idx on public.trips (user_id, start_date);

-- Linkable entity "trip": trip<->person "related" (travel companions).
create trigger trips_cleanup_links
  after delete on public.trips
  for each row execute function public.cleanup_links_on_delete('trip');

create table public.trip_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  trip_id uuid not null references public.trips (id) on delete cascade,
  type text not null check (type in ('itinerary', 'packing', 'document', 'note')),
  title text not null,
  details text,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.trip_items enable row level security;

create policy "trip_items_all_own" on public.trip_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index trip_items_trip_type_idx on public.trip_items (trip_id, type, created_at);

insert into public.modules (slug, name, description, icon, tier, sort_order) values
  ('travel', 'Travel', 'Plan trips with an itinerary, packing list, and documents.', 'plane', 'pro', 130);
