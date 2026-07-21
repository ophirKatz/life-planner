-- M3: Shopping module.

create table public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shopping_lists enable row level security;

create policy "shopping_lists_all_own" on public.shopping_lists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger shopping_lists_set_updated_at
  before update on public.shopping_lists
  for each row execute function public.set_updated_at();

create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  list_id uuid not null references public.shopping_lists (id) on delete cascade,
  name text not null,
  quantity numeric not null default 1,
  unit text,
  category text,
  checked boolean not null default false,
  position int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shopping_items enable row level security;

create policy "shopping_items_all_own" on public.shopping_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger shopping_items_set_updated_at
  before update on public.shopping_items
  for each row execute function public.set_updated_at();

create index shopping_items_list_position_idx on public.shopping_items (list_id, position);
