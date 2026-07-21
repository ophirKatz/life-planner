-- M3: Tasks module.

create table public.task_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.task_lists enable row level security;

create policy "task_lists_all_own" on public.task_lists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger task_lists_set_updated_at
  before update on public.task_lists
  for each row execute function public.set_updated_at();

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  list_id uuid references public.task_lists (id) on delete set null,
  title text not null,
  notes text,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  priority smallint not null default 0 check (priority between 0 and 3),
  due_at timestamptz,
  completed_at timestamptz,
  -- syncable-record columns (DESIGN.md §4.3) — Tasks may sync to Google Tasks later.
  source text not null default 'local',
  account_id uuid references public.connected_accounts (id) on delete set null,
  external_id text,
  external_etag text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "tasks_all_own" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create unique index tasks_account_external_id_idx on public.tasks (account_id, external_id)
  where account_id is not null;

create index tasks_user_status_idx on public.tasks (user_id, status);
create index tasks_user_due_at_idx on public.tasks (user_id, due_at);

-- Tasks are a linkable entity ("task"): deleting one cleans up its links
-- both directions (person<->task "related", task<->calendar_event "scheduled_as").
create trigger tasks_cleanup_links
  after delete on public.tasks
  for each row execute function public.cleanup_links_on_delete('task');
