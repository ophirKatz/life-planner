-- M6 test: DB-enforced free-tier limits actually reject, and flipping
-- is_pro actually unlocks — proving the DB is the backstop even if the UI
-- (or an attacker) never goes through the paywall at all.

begin;

insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
values ('00000000-0000-0000-0000-0000000000f1', 'rls-test-f@example.com', '', now(), '{}', 'authenticated', 'authenticated');

-- handle_new_user should have created a subscriptions row with is_pro=false.
do $$
begin
  assert (select is_pro from public.subscriptions where user_id = '00000000-0000-0000-0000-0000000000f1') = false,
    'new user should start on the free plan';
end $$;

-- Enable 3 free modules — should succeed (at the limit, not over it).
insert into public.user_modules (user_id, module_id, enabled)
select '00000000-0000-0000-0000-0000000000f1', id, true from public.modules where slug = 'tasks';
insert into public.user_modules (user_id, module_id, enabled)
select '00000000-0000-0000-0000-0000000000f1', id, true from public.modules where slug = 'people';
insert into public.user_modules (user_id, module_id, enabled)
select '00000000-0000-0000-0000-0000000000f1', id, true from public.modules where slug = 'habits';

-- A 4th free module must be rejected.
do $$
begin
  begin
    insert into public.user_modules (user_id, module_id, enabled)
    select '00000000-0000-0000-0000-0000000000f1', id, true from public.modules where slug = 'shopping';
    assert false, 'a 4th enabled module should have been rejected for a free user';
  exception when others then
    assert sqlerrm like 'PAYWALL:%', format('expected a PAYWALL error, got: %s', sqlerrm);
  end;
end $$;

-- The pro-tier "insights" module must be rejected regardless of count.
do $$
begin
  begin
    insert into public.user_modules (user_id, module_id, enabled)
    select '00000000-0000-0000-0000-0000000000f1', id, true from public.modules where slug = 'insights';
    assert false, 'enabling a pro module should have been rejected for a free user';
  exception when others then
    assert sqlerrm like 'PAYWALL:%', format('expected a PAYWALL error, got: %s', sqlerrm);
  end;
end $$;

-- A second connected account must be rejected...
insert into public.connected_accounts (user_id, provider, provider_account_id, access_token_enc, refresh_token_enc)
values ('00000000-0000-0000-0000-0000000000f1', 'google', 'google-sub-1', 'enc1', 'enc1');

do $$
begin
  begin
    insert into public.connected_accounts (user_id, provider, provider_account_id, access_token_enc, refresh_token_enc)
    values ('00000000-0000-0000-0000-0000000000f1', 'google', 'google-sub-2', 'enc2', 'enc2');
    assert false, 'a 2nd connected account should have been rejected for a free user';
  exception when others then
    assert sqlerrm like 'PAYWALL:%', format('expected a PAYWALL error, got: %s', sqlerrm);
  end;
end $$;

-- ...but reconnecting/refreshing the *same* account must not be blocked.
insert into public.connected_accounts (user_id, provider, provider_account_id, access_token_enc, refresh_token_enc)
values ('00000000-0000-0000-0000-0000000000f1', 'google', 'google-sub-1', 'enc1-refreshed', 'enc1-refreshed')
on conflict (user_id, provider, provider_account_id)
do update set access_token_enc = excluded.access_token_enc;

do $$
begin
  assert (select access_token_enc from public.connected_accounts
          where user_id = '00000000-0000-0000-0000-0000000000f1' and provider_account_id = 'google-sub-1')
         = 'enc1-refreshed',
    'reconnecting the same google account should update it, not be blocked';
end $$;

-- Flip the user to Pro (as the revenuecat-webhook would) — everything that
-- was blocked above must now succeed.
update public.subscriptions set is_pro = true where user_id = '00000000-0000-0000-0000-0000000000f1';

insert into public.user_modules (user_id, module_id, enabled)
select '00000000-0000-0000-0000-0000000000f1', id, true from public.modules where slug = 'shopping';
insert into public.user_modules (user_id, module_id, enabled)
select '00000000-0000-0000-0000-0000000000f1', id, true from public.modules where slug = 'insights';
insert into public.connected_accounts (user_id, provider, provider_account_id, access_token_enc, refresh_token_enc)
values ('00000000-0000-0000-0000-0000000000f1', 'google', 'google-sub-2', 'enc2', 'enc2');

do $$
begin
  assert (select count(*) from public.user_modules
          where user_id = '00000000-0000-0000-0000-0000000000f1' and enabled = true) = 5,
    'a pro user should be able to enable all 5 modules (4 free + the pro one)';
  assert (select count(*) from public.connected_accounts
          where user_id = '00000000-0000-0000-0000-0000000000f1') = 2,
    'a pro user should be able to connect a 2nd account';
end $$;

rollback;

select 'M6 paywall limits test passed' as result;
