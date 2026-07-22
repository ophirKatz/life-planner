-- Weather module (pro tier, DESIGN.md §7.3). Just a per-user location — the
-- forecast itself is always fetched live via the fetch-weather Edge
-- Function (Open-Meteo, no API key required), never cached in the DB.
-- Kept as its own table rather than columns on `profiles` so the module
-- stays self-contained (nothing outside src/modules/weather references it).

create table public.weather_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  location_lat double precision not null,
  location_lng double precision not null,
  location_label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.weather_settings enable row level security;

create policy "weather_settings_all_own" on public.weather_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger weather_settings_set_updated_at
  before update on public.weather_settings
  for each row execute function public.set_updated_at();

insert into public.modules (slug, name, description, icon, tier, sort_order) values
  ('weather', 'Weather', 'Current conditions and today''s forecast for your location.', 'cloud-sun', 'pro', 45);
