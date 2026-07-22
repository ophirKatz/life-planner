-- Climbing module (pro tier, DESIGN.md §7.3).

create table public.climbing_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_date date not null default current_date,
  location text,
  duration_minutes int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.climbing_sessions enable row level security;

create policy "climbing_sessions_all_own" on public.climbing_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger climbing_sessions_set_updated_at
  before update on public.climbing_sessions
  for each row execute function public.set_updated_at();

create index climbing_sessions_user_date_idx on public.climbing_sessions (user_id, session_date desc);

create table public.climbing_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid not null references public.climbing_sessions (id) on delete cascade,
  style text not null default 'boulder' check (style in ('boulder', 'route')),
  grade text not null,
  sent boolean not null default false,
  attempts_count int not null default 1,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.climbing_attempts enable row level security;

create policy "climbing_attempts_all_own" on public.climbing_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index climbing_attempts_session_idx on public.climbing_attempts (session_id, created_at);
create index climbing_attempts_user_sent_idx on public.climbing_attempts (user_id, sent, created_at desc);

insert into public.modules (slug, name, description, icon, tier, sort_order) values
  ('climbing', 'Climbing', 'Log sessions, attempts, and grades sent.', 'mountain', 'pro', 100);
