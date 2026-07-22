-- Recipes module (pro tier, DESIGN.md §7.3). Ingredients/instructions are
-- free text (a line per ingredient) rather than structured quantity/unit
-- rows — no AI import-from-URL in v1 (personal-dashboard's import-recipe
-- function is a possible follow-up, not ported here).

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  servings int not null default 4,
  ingredients text[] not null default '{}'::text[],
  instructions text,
  tags text[] not null default '{}'::text[],
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recipes enable row level security;

create policy "recipes_all_own" on public.recipes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger recipes_set_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

create index recipes_user_title_idx on public.recipes (user_id, title);

insert into public.modules (slug, name, description, icon, tier, sort_order) values
  ('recipes', 'Recipes', 'Save recipes with ingredients and instructions.', 'chef-hat', 'pro', 90);
