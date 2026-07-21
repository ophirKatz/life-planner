-- M6: DB-enforced free-tier limits (DESIGN.md §7.3). The UI hides/locks for
-- UX, but these triggers are the real backstop — they fire regardless of
-- caller (including the service-role Edge Functions), so a bypassed or
-- buggy client can never actually exceed the free plan.
--
-- Rejections raise with a "PAYWALL:" prefix so the client can distinguish
-- "show the paywall" from an ordinary error.

create or replace function public.enforce_module_limits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_is_pro boolean;
  module_tier text;
  enabled_count int;
begin
  if new.enabled is distinct from true then
    return new; -- disabling (or staying disabled) never needs a check
  end if;

  select s.is_pro into user_is_pro from public.subscriptions s where s.user_id = new.user_id;
  select m.tier into module_tier from public.modules m where m.id = new.module_id;

  if module_tier = 'pro' and not coalesce(user_is_pro, false) then
    raise exception 'PAYWALL: enabling a pro module requires an active subscription';
  end if;

  if not coalesce(user_is_pro, false) then
    select count(*) into enabled_count
    from public.user_modules
    where user_id = new.user_id
      and enabled = true
      and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

    if enabled_count >= 3 then
      raise exception 'PAYWALL: the free plan allows up to 3 enabled modules';
    end if;
  end if;

  return new;
end;
$$;

create trigger user_modules_enforce_limits
  before insert or update on public.user_modules
  for each row execute function public.enforce_module_limits();

create or replace function public.enforce_connected_account_limits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_is_pro boolean;
  account_count int;
begin
  select s.is_pro into user_is_pro from public.subscriptions s where s.user_id = new.user_id;

  if not coalesce(user_is_pro, false) then
    -- Exclude a row matching this upsert's conflict key: reconnecting/
    -- refreshing the *same* Google account is an update-in-disguise, not a
    -- new one, and must not trip the 1-account free limit.
    select count(*) into account_count
    from public.connected_accounts
    where user_id = new.user_id
      and not (provider = new.provider and provider_account_id = new.provider_account_id);

    if account_count >= 1 then
      raise exception 'PAYWALL: the free plan allows 1 connected account';
    end if;
  end if;

  return new;
end;
$$;

create trigger connected_accounts_enforce_limits
  before insert on public.connected_accounts
  for each row execute function public.enforce_connected_account_limits();
