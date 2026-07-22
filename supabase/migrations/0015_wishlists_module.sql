-- Wishlist module (pro tier, DESIGN.md §7.3). Consolidates what
-- personal-dashboard had as separate watchlist/reading-list concepts into
-- one typed table.

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null default 'other' check (type in ('movie', 'tv', 'book', 'game', 'other')),
  title text not null,
  status text not null default 'want' check (status in ('want', 'in_progress', 'done')),
  rating smallint check (rating between 1 and 5),
  notes text,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wishlist_items enable row level security;

create policy "wishlist_items_all_own" on public.wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger wishlist_items_set_updated_at
  before update on public.wishlist_items
  for each row execute function public.set_updated_at();

create index wishlist_items_user_created_at_idx on public.wishlist_items (user_id, created_at desc);

insert into public.modules (slug, name, description, icon, tier, sort_order) values
  ('wishlists', 'Wishlist', 'Movies, shows, books, and games to come back to.', 'bookmark', 'pro', 80);
