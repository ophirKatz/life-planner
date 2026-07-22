-- Interaction log + AI relationship summaries for the People module
-- (DESIGN.md §7.3: a pro feature living inside an otherwise-free module).
-- people_interactions is plain user data (free to use); person_summaries is
-- the AI-generated cache, written only by the summarize-person-interactions
-- Edge Function (service role) after it checks subscriptions.is_pro — the
-- client never inserts/updates it directly, mirroring the subscriptions
-- table's own read-only-to-client pattern.

create table public.people_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  person_id uuid not null references public.people (id) on delete cascade,
  interaction_date date not null default current_date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.people_interactions enable row level security;

create policy "people_interactions_all_own" on public.people_interactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger people_interactions_set_updated_at
  before update on public.people_interactions
  for each row execute function public.set_updated_at();

create index people_interactions_person_idx
  on public.people_interactions (person_id, interaction_date desc);

create table public.person_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  person_id uuid not null references public.people (id) on delete cascade,
  summary text,
  status text not null default 'pending' check (status in ('pending', 'ready', 'error')),
  error text,
  generated_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, person_id)
);

alter table public.person_summaries enable row level security;

create policy "person_summaries_select_own" on public.person_summaries
  for select using (auth.uid() = user_id);

create trigger person_summaries_set_updated_at
  before update on public.person_summaries
  for each row execute function public.set_updated_at();
