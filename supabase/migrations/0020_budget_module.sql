-- Budget & Spending module (pro tier, DESIGN.md §7.3).

create table public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  monthly_limit numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.budget_categories enable row level security;

create policy "budget_categories_all_own" on public.budget_categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger budget_categories_set_updated_at
  before update on public.budget_categories
  for each row execute function public.set_updated_at();

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.budget_categories (id) on delete set null,
  amount numeric not null check (amount > 0),
  type text not null default 'expense' check (type in ('income', 'expense')),
  occurred_at date not null default current_date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "transactions_all_own" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

create index transactions_user_occurred_at_idx on public.transactions (user_id, occurred_at desc);

insert into public.modules (slug, name, description, icon, tier, sort_order) values
  ('budget', 'Budget', 'Track income and spending by category.', 'wallet', 'pro', 110);
