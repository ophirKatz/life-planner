-- M7 test: push_tokens RLS isolation, and that notifications_outbox rows
-- become "due" (visible to the same query send-notifications runs) exactly
-- when deliver_at has passed and sent_at is still null.

begin;

insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
values
  ('00000000-0000-0000-0000-0000000000a1', 'rls-test-a@example.com', '', now(), '{}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000b2', 'rls-test-b@example.com', '', now(), '{}', 'authenticated', 'authenticated');

insert into public.push_tokens (user_id, expo_push_token, platform) values
  ('00000000-0000-0000-0000-0000000000a1', 'ExponentPushToken[aaa]', 'ios'),
  ('00000000-0000-0000-0000-0000000000b2', 'ExponentPushToken[bbb]', 'android');

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

do $$
begin
  assert (select count(*) from public.push_tokens) = 1, 'user A should see only their own push token';
  assert (select expo_push_token from public.push_tokens limit 1) = 'ExponentPushToken[aaa]',
    'user A should not see user B''s push token';
end $$;

reset role;

-- One past-due unsent reminder, one already-sent, one in the future — only
-- the first should match send-notifications' selection criteria.
insert into public.notifications_outbox (user_id, title, body, deliver_at, sent_at) values
  ('00000000-0000-0000-0000-0000000000a1', 'Due now', 'body', now() - interval '1 minute', null),
  ('00000000-0000-0000-0000-0000000000a1', 'Already sent', 'body', now() - interval '1 hour', now() - interval '30 minutes'),
  ('00000000-0000-0000-0000-0000000000a1', 'Future', 'body', now() + interval '1 hour', null);

do $$
begin
  assert (
    select count(*) from public.notifications_outbox
    where sent_at is null and deliver_at <= now()
  ) = 1, 'exactly one reminder should be due for delivery';
  assert (
    select title from public.notifications_outbox
    where sent_at is null and deliver_at <= now()
  ) = 'Due now', 'the due reminder should be the past-due unsent one';
end $$;

rollback;

select 'M7 push tokens + outbox test passed' as result;
