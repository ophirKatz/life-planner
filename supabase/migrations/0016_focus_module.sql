-- Focus module (pro tier, DESIGN.md §7.3): an AI-curated digest of tasks and
-- calendar events. The module is gated entirely at the tier level, not
-- per-feature, since AI curation is its only value — there's no free CRUD
-- underneath it (unlike People's AI summary, which sits inside otherwise-
-- free data). Cache table only; written by generate-focus-summary (service
-- role) after it checks subscriptions.is_pro itself.

create table public.focus_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  period text not null check (period in ('tomorrow', 'week')),
  status text not null default 'pending' check (status in ('pending', 'ready', 'error')),
  summary jsonb,
  error text,
  generated_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, period)
);

alter table public.focus_summaries enable row level security;

create policy "focus_summaries_select_own" on public.focus_summaries
  for select using (auth.uid() = user_id);

create trigger focus_summaries_set_updated_at
  before update on public.focus_summaries
  for each row execute function public.set_updated_at();

insert into public.modules (slug, name, description, icon, tier, sort_order) values
  ('focus', 'Focus', 'An AI-curated digest of what''s ahead — tomorrow or this week.', 'zap', 'pro', 65);
