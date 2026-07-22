-- Idea Log module (pro tier, DESIGN.md §7.3).

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  tags text[] not null default '{}'::text[],
  status text not null default 'new' check (status in ('new', 'exploring', 'archived', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ideas enable row level security;

create policy "ideas_all_own" on public.ideas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger ideas_set_updated_at
  before update on public.ideas
  for each row execute function public.set_updated_at();

create index ideas_user_created_at_idx on public.ideas (user_id, created_at desc);

-- Linkable entity "idea": idea<->task "related" ("turn into a task").
create trigger ideas_cleanup_links
  after delete on public.ideas
  for each row execute function public.cleanup_links_on_delete('idea');

insert into public.modules (slug, name, description, icon, tier, sort_order) values
  ('ideas', 'Idea Log', 'Capture and tag ideas before they slip away.', 'lightbulb', 'pro', 70);
