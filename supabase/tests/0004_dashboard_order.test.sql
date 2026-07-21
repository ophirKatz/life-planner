-- M4 test: user_modules.position respects RLS and swap-based reorder works
-- the same way as the shopping_items pattern it's copied from.

begin;

insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
values ('00000000-0000-0000-0000-0000000000e1', 'rls-test-e@example.com', '', now(), '{}', 'authenticated', 'authenticated');

insert into public.user_modules (id, user_id, module_id, enabled, position)
select '00000000-0000-0000-0000-00000000b001', '00000000-0000-0000-0000-0000000000e1', id, true, 0
from public.modules where slug = 'tasks';

insert into public.user_modules (id, user_id, module_id, enabled, position)
select '00000000-0000-0000-0000-00000000b002', '00000000-0000-0000-0000-0000000000e1', id, true, 1
from public.modules where slug = 'people';

-- Swap positions, as the Store screen's up/down arrows do.
update public.user_modules set position = 1 where id = '00000000-0000-0000-0000-00000000b001';
update public.user_modules set position = 0 where id = '00000000-0000-0000-0000-00000000b002';

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000e1","role":"authenticated"}';

do $$
begin
  assert (select module_id from public.user_modules order by position asc limit 1) =
         (select id from public.modules where slug = 'people'),
    'after the swap, People should be first in dashboard order';
  assert (select module_id from public.user_modules order by position asc offset 1 limit 1) =
         (select id from public.modules where slug = 'tasks'),
    'after the swap, Tasks should be second in dashboard order';
end $$;

reset role;
rollback;

select 'M4 dashboard order test passed' as result;
