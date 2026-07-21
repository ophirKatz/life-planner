-- M5: periodic Google Calendar sync (DESIGN.md §6.4 — "pg_cron runs sync
-- every N minutes per active account").
--
-- MANUAL SETUP REQUIRED (never put a real secret in a migration file):
-- run this once in the SQL editor, with your project's actual service_role
-- key, before this schedule can successfully call the Edge Function:
--
--   select vault.create_secret('<your-service-role-key>', 'service_role_key');
--
-- Until that secret exists, the scheduled call fails closed (no crash, just
-- an empty Authorization header that the function's own service-role check
-- inside supabaseAdmin.ts... no — the *cron job* fails to authenticate, and
-- Postgres logs a failed net.http_post; nothing about user data is at risk).

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'sync-google-calendar-every-15-minutes',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://jtfvehpasmbnxxyaqdvh.supabase.co/functions/v1/sync-google-calendar',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'service_role_key'
        limit 1
      )
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
