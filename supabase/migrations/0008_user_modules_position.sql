-- M4: explicit user-defined ordering for the Home dashboard (DESIGN.md §5.2:
-- "Home dashboard renders dashboardWidgets only for enabled modules, in user
-- order"). installed_at order was a reasonable default but isn't reorderable.

alter table public.user_modules add column position int not null default 0;

-- Backfill existing rows with their current installed_at order per user.
with ordered as (
  select id, row_number() over (partition by user_id order by installed_at) - 1 as rn
  from public.user_modules
)
update public.user_modules
set position = ordered.rn
from ordered
where public.user_modules.id = ordered.id;
