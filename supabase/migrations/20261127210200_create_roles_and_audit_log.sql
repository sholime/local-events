-- Roles and the audit log.
--
-- Every role lives in role_assignments, together with what it is given for:
--   super_admin       the whole platform        scope_type 'platform', no scope_id
--   platform_manager  one venue (a row each)    scope_type 'venue',    scope_id = the venue
--   venue_admin       one venue (a row each)    scope_type 'venue',    scope_id = the venue
--   event_manager     one event                 scope_type 'event',    scope_id = the event
-- A new role is a new value here, not a new table. Venues and events arrive in phase 2;
-- scope_id points at either, so it has no foreign key.

create table public.role_assignments (
  id uuid primary key default public.uuid_v7(),
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null check (role in ('super_admin', 'platform_manager', 'venue_admin', 'event_manager')),
  scope_type text not null check (scope_type in ('platform', 'venue', 'event')),
  scope_id uuid,
  assigned_by uuid references public.users (id) on delete set null,
  assigned_at timestamptz not null default now(),
  constraint role_matches_scope check (
    (role = 'super_admin' and scope_type = 'platform' and scope_id is null)
    or (role in ('platform_manager', 'venue_admin') and scope_type = 'venue' and scope_id is not null)
    or (role = 'event_manager' and scope_type = 'event' and scope_id is not null)
  ),
  -- The same role for the same scope only once. NULLS NOT DISTINCT makes this hold for
  -- super_admin too, whose scope_id is null.
  constraint one_role_per_scope unique nulls not distinct (user_id, role, scope_id)
);

create index role_assignments_scope on public.role_assignments (scope_type, scope_id);

comment on table public.role_assignments is 'Who has which role, and for which venue or event.';

-- Who did what, for impersonation, role changes, blocking, result corrections and
-- reservation decisions. Never readable or writable through the API: rows are added
-- only by database functions and triggers.
create table public.audit_log (
  id uuid primary key default public.uuid_v7(),
  -- Who did it. Null when done by hand in the database (e.g. scripts/make_super_admin.sql).
  actor_id uuid references public.users (id) on delete set null,
  -- When a super admin or platform manager acts as a venue admin: the venue admin's id.
  acting_as_id uuid references public.users (id) on delete set null,
  action text not null,
  object_type text not null,
  object_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_object on public.audit_log (object_type, object_id);

comment on table public.audit_log is 'Who did what and when. Written only by the database itself.';

-- ---------------------------------------------------------------------------
-- Role checks, used by the access rules of every table
-- ---------------------------------------------------------------------------

-- They run with the definer's rights so that a rule on role_assignments can call them
-- without looking itself up through its own rule again. They only ever answer about the
-- logged-in user (auth.uid()), so they reveal nothing about anyone else.

create function public.has_role(check_role text, check_scope_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.role_assignments
    where user_id = (select auth.uid())
      and role = check_role
      and scope_id is not distinct from check_scope_id
  );
$$;

comment on function public.has_role(text, uuid) is
  'Whether the logged-in user has the role for that venue or event, e.g. has_role(''venue_admin'', <venue id>).';

create function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role('super_admin', null);
$$;

-- A platform manager for at least one venue. Platform managers may list and block any user.
create function public.is_platform_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.role_assignments
    where user_id = (select auth.uid()) and role = 'platform_manager'
  );
$$;

-- ---------------------------------------------------------------------------
-- Writing the audit log
-- ---------------------------------------------------------------------------

create function public.write_audit_log(
  action text,
  object_type text,
  object_id uuid,
  old_value jsonb,
  new_value jsonb
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.audit_log (actor_id, action, object_type, object_id, old_value, new_value)
  values ((select auth.uid()), action, object_type, object_id, old_value, new_value);
$$;

-- Every role given or taken away is logged.
create function public.log_role_assignment_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.write_audit_log('role.assign', 'role_assignment', new.id, null, to_jsonb(new));
    return new;
  else
    perform public.write_audit_log('role.remove', 'role_assignment', old.id, to_jsonb(old), null);
    return old;
  end if;
end;
$$;

create trigger log_role_assignment_change
  after insert or delete on public.role_assignments
  for each row execute function public.log_role_assignment_change();

-- ---------------------------------------------------------------------------
-- Blocking users
-- ---------------------------------------------------------------------------

-- Super admins and platform managers may block or unblock anyone. It goes through this
-- function rather than a column grant, so that people cannot unblock themselves.
create function public.set_user_blocked(target_user_id uuid, blocked boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  was_blocked boolean;
begin
  if not (public.is_super_admin() or public.is_platform_manager()) then
    raise exception 'Only super admins and platform managers can block users'
      using errcode = '42501';
  end if;

  select is_blocked into was_blocked from public.users where id = target_user_id for update;
  if not found then
    raise exception 'No such user' using errcode = 'P0002';
  end if;

  update public.users set is_blocked = blocked where id = target_user_id;
  perform public.write_audit_log(
    case when blocked then 'user.block' else 'user.unblock' end,
    'user', target_user_id,
    jsonb_build_object('is_blocked', was_blocked),
    jsonb_build_object('is_blocked', blocked)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Access through the API
-- ---------------------------------------------------------------------------

-- Functions can be run by everyone unless taken away, so take that away first and give
-- back only what the app needs. The audit log functions stay internal.
revoke execute on function
  public.uuid_v7(),
  public.handle_new_auth_user(),
  public.has_role(text, uuid),
  public.is_super_admin(),
  public.is_platform_manager(),
  public.write_audit_log(text, text, uuid, jsonb, jsonb),
  public.log_role_assignment_change(),
  public.set_user_blocked(uuid, boolean)
from public, anon, authenticated;

grant execute on function
  public.uuid_v7(),
  public.has_role(text, uuid),
  public.is_super_admin(),
  public.is_platform_manager(),
  public.set_user_blocked(uuid, boolean)
to authenticated;

revoke all on table public.role_assignments from anon, authenticated;
grant select, insert, delete on table public.role_assignments to authenticated;

revoke all on table public.audit_log from anon, authenticated;

alter table public.role_assignments enable row level security;
alter table public.audit_log enable row level security;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

-- users: everyone reads their own profile; super admins and platform managers read all
-- (they need the list to block people). Everyone changes only their own profile.
create policy "Users read their own profile, admins read all"
  on public.users for select to authenticated
  using (id = (select auth.uid()) or (select public.is_super_admin()) or (select public.is_platform_manager()));

create policy "Users change their own profile"
  on public.users for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- role_assignments: everyone reads their own roles (the app needs them to show the right
-- panels); super admins read all. For now only super admins give and take away roles.
-- Venue admins giving the event manager role, and platform managers giving venue admin,
-- come with venues and events in phase 2.
create policy "Users read their own roles, super admins read all"
  on public.role_assignments for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_super_admin()));

create policy "Super admins give roles"
  on public.role_assignments for insert to authenticated
  with check ((select public.is_super_admin()) and assigned_by = (select auth.uid()));

create policy "Super admins take roles away"
  on public.role_assignments for delete to authenticated
  using ((select public.is_super_admin()));

-- audit_log: no rules, so with row level security on, nobody reads or writes it through
-- the API. Database functions (security definer) still write to it.
