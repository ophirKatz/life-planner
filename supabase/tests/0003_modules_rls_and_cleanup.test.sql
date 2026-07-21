-- M3 test: RLS isolation across all 5 seed-module tables, plus verification
-- that the link-cleanup trigger (attached to tasks/people/calendar_events in
-- migrations 0003-0005) does exactly what DESIGN.md §4.5 promises: deleting a
-- linkable entity removes its links but leaves the other side's rows intact.
-- Runs inside a transaction that's rolled back; leaves no trace.

begin;

insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
values
  ('00000000-0000-0000-0000-0000000000c1', 'rls-test-c@example.com', '', now(), '{}', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000d2', 'rls-test-d@example.com', '', now(), '{}', 'authenticated', 'authenticated');

-- One row per new table, per user.
insert into public.task_lists (id, user_id, name) values
  ('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-0000000000c1', 'C''s list'),
  ('00000000-0000-0000-0000-00000000a002', '00000000-0000-0000-0000-0000000000d2', 'D''s list');

insert into public.tasks (id, user_id, list_id, title) values
  ('00000000-0000-0000-0000-00000000a011', '00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-00000000a001', 'C task'),
  ('00000000-0000-0000-0000-00000000a012', '00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-00000000a002', 'D task');

insert into public.calendar_events (id, user_id, title, starts_at, ends_at) values
  ('00000000-0000-0000-0000-00000000a021', '00000000-0000-0000-0000-0000000000c1', 'C event', now(), now() + interval '1 hour'),
  ('00000000-0000-0000-0000-00000000a022', '00000000-0000-0000-0000-0000000000d2', 'D event', now(), now() + interval '1 hour');

insert into public.people (id, user_id, display_name) values
  ('00000000-0000-0000-0000-00000000a031', '00000000-0000-0000-0000-0000000000c1', 'C person'),
  ('00000000-0000-0000-0000-00000000a032', '00000000-0000-0000-0000-0000000000d2', 'D person');

insert into public.habits (id, user_id, name) values
  ('00000000-0000-0000-0000-00000000a041', '00000000-0000-0000-0000-0000000000c1', 'C habit'),
  ('00000000-0000-0000-0000-00000000a042', '00000000-0000-0000-0000-0000000000d2', 'D habit');

insert into public.habit_logs (user_id, habit_id, date) values
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-00000000a041', current_date),
  ('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-00000000a042', current_date);

insert into public.shopping_lists (id, user_id, name) values
  ('00000000-0000-0000-0000-00000000a051', '00000000-0000-0000-0000-0000000000c1', 'C shopping'),
  ('00000000-0000-0000-0000-00000000a052', '00000000-0000-0000-0000-0000000000d2', 'D shopping');

insert into public.shopping_items (user_id, list_id, name) values
  ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-00000000a051', 'Milk'),
  ('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-00000000a052', 'Eggs');

-- Links for user C only: person<->task "related", person<->event "attendee",
-- task<->event "scheduled_as".
insert into public.links (user_id, from_type, from_id, to_type, to_id, rel_type) values
  ('00000000-0000-0000-0000-0000000000c1', 'person', '00000000-0000-0000-0000-00000000a031', 'task', '00000000-0000-0000-0000-00000000a011', 'related'),
  ('00000000-0000-0000-0000-0000000000c1', 'person', '00000000-0000-0000-0000-00000000a031', 'calendar_event', '00000000-0000-0000-0000-00000000a021', 'attendee'),
  ('00000000-0000-0000-0000-0000000000c1', 'task', '00000000-0000-0000-0000-00000000a011', 'calendar_event', '00000000-0000-0000-0000-00000000a021', 'scheduled_as');

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000c1","role":"authenticated"}';

do $$
begin
  assert (select count(*) from public.task_lists) = 1, 'user C should see only their own task_lists row';
  assert (select count(*) from public.tasks) = 1, 'user C should see only their own tasks row';
  assert (select count(*) from public.calendar_events) = 1, 'user C should see only their own calendar_events row';
  assert (select count(*) from public.people) = 1, 'user C should see only their own people row';
  assert (select count(*) from public.habits) = 1, 'user C should see only their own habits row';
  assert (select count(*) from public.habit_logs) = 1, 'user C should see only their own habit_logs row';
  assert (select count(*) from public.shopping_lists) = 1, 'user C should see only their own shopping_lists row';
  assert (select count(*) from public.shopping_items) = 1, 'user C should see only their own shopping_items row';
end $$;

set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000d2","role":"authenticated"}';

do $$
begin
  assert (select count(*) from public.task_lists) = 1, 'user D should see only their own task_lists row';
  assert (select count(*) from public.tasks) = 1, 'user D should see only their own tasks row';
  assert (select count(*) from public.calendar_events) = 1, 'user D should see only their own calendar_events row';
  assert (select count(*) from public.people) = 1, 'user D should see only their own people row';
  assert (select count(*) from public.habits) = 1, 'user D should see only their own habits row';
  assert (select count(*) from public.shopping_lists) = 1, 'user D should see only their own shopping_lists row';
  assert (select count(*) from public.shopping_items) = 1, 'user D should see only their own shopping_items row';
end $$;

reset role;

-- Cleanup-trigger check: deleting the person should remove the "related" and
-- "attendee" links, but leave the task, the event, and the task<->event
-- "scheduled_as" link completely untouched.
delete from public.people where id = '00000000-0000-0000-0000-00000000a031';

do $$
begin
  assert (select count(*) from public.links where '00000000-0000-0000-0000-00000000a031' in (from_id, to_id)) = 0,
    'deleting the person should have cleaned up its links';
  assert (select count(*) from public.tasks where id = '00000000-0000-0000-0000-00000000a011') = 1,
    'deleting the person must not delete the linked task';
  assert (select count(*) from public.calendar_events where id = '00000000-0000-0000-0000-00000000a021') = 1,
    'deleting the person must not delete the linked event';
  assert (select count(*) from public.links
          where from_type = 'task' and to_type = 'calendar_event' and rel_type = 'scheduled_as') = 1,
    'the task<->event link (unrelated to the deleted person) must survive';
end $$;

rollback;

select 'M3 RLS isolation + link cleanup test passed' as result;
