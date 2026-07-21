-- M7: deliver due reminders every minute (DESIGN.md §M7 — pg_cron +
-- send-notifications). Same Vault-secret pattern as migration 0009; see
-- that file's comment for the one-time manual setup step.

select cron.schedule(
  'send-notifications-every-minute',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://jtfvehpasmbnxxyaqdvh.supabase.co/functions/v1/send-notifications',
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
