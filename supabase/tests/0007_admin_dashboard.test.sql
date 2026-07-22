-- Admin control plane test (DESIGN.md §7.4): a non-admin can't write to
-- modules/feature_flags and can't self-promote; an admin can write to both.
-- Uses the same `set local role` + `request.jwt.claims` technique as
-- 0002_rls_isolation.test.sql to simulate real authenticated sessions.

begin;

insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
values
  ('00000000-0000-0000-0000-0000000000c1', 'admin-test@example.com', '', now(), '{}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000c2', 'nonadmin-test@example.com', '', now(), '{}', 'authenticated', 'authenticated');

-- Promote c1 to admin the only way the schema allows it — as the
-- unrestricted role running this test, not through the authenticated grant.
update public.profiles set is_admin = true where id = '00000000-0000-0000-0000-0000000000c1';

do $$
begin
  assert (select is_admin from public.profiles where id = '00000000-0000-0000-0000-0000000000c1') = true,
    'admin test user should be marked is_admin';
  assert (select is_admin from public.profiles where id = '00000000-0000-0000-0000-0000000000c2') = false,
    'non-admin test user should default to is_admin=false';
end $$;

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000c2","role":"authenticated"}';

-- A non-admin's write to modules is silently filtered out by RLS (no error,
-- just zero rows affected), not applied.
update public.modules set is_active = false where slug = 'tasks';

do $$
begin
  assert (select is_active from public.modules where slug = 'tasks') = true,
    'a non-admin update to modules should not have taken effect';
end $$;

update public.feature_flags set enabled = false where key = 'ai_people_summary';

do $$
begin
  assert (select enabled from public.feature_flags where key = 'ai_people_summary') = true,
    'a non-admin update to feature_flags should not have taken effect';
end $$;

-- Self-promotion must be rejected outright (column-level revoke), not just
-- silently filtered.
do $$
begin
  begin
    update public.profiles set is_admin = true where id = auth.uid();
    assert false, 'a non-admin should not be able to grant themselves is_admin';
  exception when insufficient_privilege then
    null; -- expected
  end;
end $$;

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000c1","role":"authenticated"}';

update public.modules set is_active = false where slug = 'tasks';
update public.feature_flags set enabled = false where key = 'ai_people_summary';

do $$
begin
  assert (select is_active from public.modules where slug = 'tasks') = false,
    'an admin update to modules should have taken effect';
  assert (select enabled from public.feature_flags where key = 'ai_people_summary') = false,
    'an admin update to feature_flags should have taken effect';
end $$;

reset role;
rollback;

select 'admin dashboard test passed' as result;
