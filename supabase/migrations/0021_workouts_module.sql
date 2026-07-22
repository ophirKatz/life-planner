-- Workouts module (pro tier, DESIGN.md §7.3). Exercises are free text (one
-- line each) rather than structured sets/reps rows, matching the same
-- simplification used for Recipes' ingredients.

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_date date not null default current_date,
  type text not null default 'strength' check (type in ('strength', 'cardio', 'yoga', 'other')),
  duration_minutes int,
  exercises text[] not null default '{}'::text[],
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workouts enable row level security;

create policy "workouts_all_own" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger workouts_set_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();

create index workouts_user_date_idx on public.workouts (user_id, workout_date desc);

insert into public.modules (slug, name, description, icon, tier, sort_order) values
  ('workouts', 'Workouts', 'Log workouts and keep your streak going.', 'dumbbell', 'pro', 120);
