-- M3: Habits module. Streaks are computed client-side from habit_logs, not stored.

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  icon text not null default 'flame',
  color text not null default '#6366f1',
  cadence text not null default 'daily' check (cadence in ('daily', 'weekly', 'custom')),
  target_per_period smallint not null default 1,
  schedule jsonb not null default '{}'::jsonb,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.habits enable row level security;

create policy "habits_all_own" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  date date not null,
  count smallint not null default 1,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, habit_id, date)
);

alter table public.habit_logs enable row level security;

create policy "habit_logs_all_own" on public.habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger habit_logs_set_updated_at
  before update on public.habit_logs
  for each row execute function public.set_updated_at();

create index habit_logs_habit_date_idx on public.habit_logs (habit_id, date);
