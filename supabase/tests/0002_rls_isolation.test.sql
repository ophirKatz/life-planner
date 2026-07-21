-- RLS isolation test for M1. Run against the project with `execute_sql` /
-- `psql`; everything happens inside a transaction that is rolled back, so it
-- leaves no trace in real data. Uses `set local role` + `request.jwt.claims`
-- to simulate two different authenticated sessions, per Supabase's documented
-- technique for testing RLS policies from plain SQL.

begin;

insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
values
  ('00000000-0000-0000-0000-0000000000a1', 'rls-test-a@example.com', '', now(), '{}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000b2', 'rls-test-b@example.com', '', now(), '{}', 'authenticated', 'authenticated');

-- Sanity check: the M0/M1 new-user trigger should have fired for both.
do $$
begin
  assert (select count(*) from public.profiles
          where id in ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b2')) = 2,
    'profiles auto-create trigger did not fire for both test users';
  assert (select count(*) from public.subscriptions
          where user_id in ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b2')) = 2,
    'subscriptions auto-create trigger did not fire for both test users';
end $$;

insert into public.user_modules (user_id, module_id, enabled)
select '00000000-0000-0000-0000-0000000000a1', id, true from public.modules where slug = 'tasks';
insert into public.user_modules (user_id, module_id, enabled)
select '00000000-0000-0000-0000-0000000000b2', id, true from public.modules where slug = 'tasks';

insert into public.links (user_id, from_type, from_id, to_type, to_id, rel_type)
values
  ('00000000-0000-0000-0000-0000000000a1', 'person', gen_random_uuid(), 'task', gen_random_uuid(), 'related'),
  ('00000000-0000-0000-0000-0000000000b2', 'person', gen_random_uuid(), 'task', gen_random_uuid(), 'related');

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

do $$
begin
  assert (select count(*) from public.user_modules) = 1, 'user A should see exactly 1 user_modules row (their own)';
  assert (select count(*) from public.links) = 1, 'user A should see exactly 1 links row (their own)';
  assert (select user_id from public.user_modules limit 1) = '00000000-0000-0000-0000-0000000000a1'::uuid,
    'user A saw someone else''s user_modules row';
  assert (select count(*) from public.modules) = 6, 'catalog should be fully readable regardless of owner';
end $$;

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}';

do $$
begin
  assert (select count(*) from public.user_modules) = 1, 'user B should see exactly 1 user_modules row (their own)';
  assert (select count(*) from public.links) = 1, 'user B should see exactly 1 links row (their own)';
  assert (select user_id from public.user_modules limit 1) = '00000000-0000-0000-0000-0000000000b2'::uuid,
    'user B saw someone else''s user_modules row';
end $$;

reset role;
rollback;

select 'RLS isolation test passed' as result;
