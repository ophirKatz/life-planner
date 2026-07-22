-- Tier/limit policy update (DESIGN.md §7.3):
--   * Habits moves to the pro tier. The free tier is now exactly the four
--     named modules (tasks, calendar, people, shopping) plus the pre-existing
--     "insights" pro placeholder stays pro.
--   * Free-plan connected accounts grows from 1 to 2.
--   * The old flat "3 enabled modules" count cap is dropped — gating is now
--     purely per-module tier, not a count, so a free user can enable every
--     free-tier module at once without tripping an unrelated ceiling.
--   * enforce_module_limits also rejects enabling a module whose catalog row
--     has is_active = false. modules.is_active is a developer kill switch
--     (already filtered into the Store's catalog listing); this closes the
--     gap where a client that bypasses the Store UI could still enable a
--     deactivated module directly. Not a paywall condition, so it does not
--     use the "PAYWALL:" error prefix — the app-side visibility fix for
--     already-enabled users lives in useEnabledModules/useIsModuleEnabled
--     (src/core/modules/hooks.ts), which check is_active on every read.

update public.modules set tier = 'pro' where slug = 'habits';

create or replace function public.enforce_module_limits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_is_pro boolean;
  module_tier text;
  module_is_active boolean;
begin
  if new.enabled is distinct from true then
    return new; -- disabling (or staying disabled) never needs a check
  end if;

  select s.is_pro into user_is_pro from public.subscriptions s where s.user_id = new.user_id;
  select m.tier, m.is_active into module_tier, module_is_active
    from public.modules m where m.id = new.module_id;

  if not coalesce(module_is_active, false) then
    raise exception 'MODULE_UNAVAILABLE: this module is not currently available';
  end if;

  if module_tier = 'pro' and not coalesce(user_is_pro, false) then
    raise exception 'PAYWALL: enabling a pro module requires an active subscription';
  end if;

  return new;
end;
$$;

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
    -- new one, and must not trip the free limit.
    select count(*) into account_count
    from public.connected_accounts
    where user_id = new.user_id
      and not (provider = new.provider and provider_account_id = new.provider_account_id);

    if account_count >= 2 then
      raise exception 'PAYWALL: the free plan allows up to 2 connected accounts';
    end if;
  end if;

  return new;
end;
$$;
