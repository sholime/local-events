-- Tests the profiles, roles and access rules from the first migrations.
-- Run with `npx supabase test db` against the local database (CI does the same).
-- Everything happens inside one transaction that is rolled back at the end.

begin;
create extension if not exists pgtap with schema extensions;
select plan(24);

-- Three people sign up: Ana (no role), Boss (super admin) and Petra (platform manager).
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-7000-8000-00000000000a', 'ana@example.com',
   '{"display_name": "Ana Jović", "language": "en", "privacy_accepted_at": "2026-11-27T19:30:00Z"}'),
  ('00000000-0000-7000-8000-00000000000b', 'boss@example.com', '{"full_name": "Boss Bosić"}'),
  ('00000000-0000-7000-8000-00000000000c', 'petra@example.com', '{}');

-- Roles given by hand, as scripts/make_super_admin.sql does.
insert into public.role_assignments (user_id, role, scope_type, scope_id) values
  ('00000000-0000-7000-8000-00000000000b', 'super_admin', 'platform', null),
  ('00000000-0000-7000-8000-00000000000c', 'platform_manager', 'venue', '00000000-0000-7000-8000-0000000000f1');

-- ---------------------------------------------------------------------------
-- Profiles are made on sign-up
-- ---------------------------------------------------------------------------

select results_eq(
  $$ select display_name, language, privacy_accepted_at is not null from public.users where email = 'ana@example.com' $$,
  $$ values ('Ana Jović'::text, 'en'::text, true) $$,
  'sign-up makes a profile with the name, language and privacy acceptance sent'
);
select is(
  (select display_name from public.users where email = 'boss@example.com'), 'Boss Bosić',
  'Google sign-in uses full_name'
);
select results_eq(
  $$ select display_name, language, privacy_accepted_at is null from public.users where email = 'petra@example.com' $$,
  $$ values ('petra'::text, 'sr'::text, true) $$,
  'without metadata the name comes from the email, the language is Serbian and privacy is still to accept'
);
select is(substr(public.uuid_v7()::text, 15, 1), '7', 'uuid_v7() makes version 7 ids');
select is((select count(*)::int from public.audit_log where action = 'role.assign'), 2, 'giving a role is logged');

-- ---------------------------------------------------------------------------
-- Roles must match their scope
-- ---------------------------------------------------------------------------

select throws_ok(
  $$ insert into public.role_assignments (user_id, role, scope_type, scope_id)
     values ('00000000-0000-7000-8000-00000000000a', 'venue_admin', 'venue', null) $$,
  '23514', null, 'a venue admin needs a venue'
);
select throws_ok(
  $$ insert into public.role_assignments (user_id, role, scope_type, scope_id)
     values ('00000000-0000-7000-8000-00000000000a', 'super_admin', 'venue', '00000000-0000-7000-8000-0000000000f1') $$,
  '23514', null, 'a super admin is for the whole platform only'
);
select throws_ok(
  $$ insert into public.role_assignments (user_id, role, scope_type, scope_id)
     values ('00000000-0000-7000-8000-00000000000b', 'super_admin', 'platform', null) $$,
  '23505', null, 'the same role for the same scope only once'
);

-- ---------------------------------------------------------------------------
-- Not logged in
-- ---------------------------------------------------------------------------

set local role anon;
select throws_ok($$ select * from public.users $$, '42501', null, 'not logged in: cannot read profiles');
select throws_ok($$ select * from public.role_assignments $$, '42501', null, 'not logged in: cannot read roles');

-- ---------------------------------------------------------------------------
-- Ana, without a role
-- ---------------------------------------------------------------------------

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-7000-8000-00000000000a", "role": "authenticated"}';

select results_eq($$ select email from public.users $$, $$ values ('ana@example.com'::text) $$, 'Ana sees only her own profile');
select is((select count(*)::int from public.role_assignments), 0, 'Ana sees no roles, as she has none');
select throws_ok($$ select * from public.audit_log $$, '42501', null, 'Ana cannot read the audit log');

update public.users set display_name = 'Ana J.' where id = '00000000-0000-7000-8000-00000000000a';
select is((select display_name from public.users), 'Ana J.', 'Ana changes her own name');

update public.users set display_name = 'Hacked' where id = '00000000-0000-7000-8000-00000000000b';
select throws_ok(
  $$ update public.users set is_blocked = false where id = '00000000-0000-7000-8000-00000000000a' $$,
  '42501', null, 'Ana cannot change her own block'
);
select throws_ok(
  $$ insert into public.role_assignments (user_id, role, scope_type, assigned_by)
     values ('00000000-0000-7000-8000-00000000000a', 'super_admin', 'platform', '00000000-0000-7000-8000-00000000000a') $$,
  '42501', null, 'Ana cannot make herself super admin'
);
select throws_ok(
  $$ select public.set_user_blocked('00000000-0000-7000-8000-00000000000b', true) $$,
  '42501', null, 'Ana cannot block anyone'
);

-- ---------------------------------------------------------------------------
-- Boss, super admin
-- ---------------------------------------------------------------------------

set local request.jwt.claims = '{"sub": "00000000-0000-7000-8000-00000000000b", "role": "authenticated"}';

select is((select display_name from public.users where email = 'boss@example.com'), 'Boss Bosić', 'nobody else changed Boss''s name');
select is((select count(*)::int from public.users), 3, 'a super admin sees every profile');
select is((select count(*)::int from public.role_assignments), 2, 'a super admin sees every role');
select lives_ok(
  $$ insert into public.role_assignments (user_id, role, scope_type, scope_id, assigned_by)
     values ('00000000-0000-7000-8000-00000000000a', 'venue_admin', 'venue', '00000000-0000-7000-8000-0000000000f1',
             '00000000-0000-7000-8000-00000000000b') $$,
  'a super admin gives a role'
);

-- ---------------------------------------------------------------------------
-- Petra, platform manager
-- ---------------------------------------------------------------------------

set local request.jwt.claims = '{"sub": "00000000-0000-7000-8000-00000000000c", "role": "authenticated"}';

select is((select count(*)::int from public.users), 3, 'a platform manager sees every profile');
select lives_ok(
  $$ select public.set_user_blocked('00000000-0000-7000-8000-00000000000a', true) $$,
  'a platform manager blocks a user'
);

reset role;
select results_eq(
  $$ select u.is_blocked, l.actor_id from public.users u
     join public.audit_log l on l.object_id = u.id and l.action = 'user.block'
     where u.id = '00000000-0000-7000-8000-00000000000a' $$,
  $$ values (true, '00000000-0000-7000-8000-00000000000c'::uuid) $$,
  'the block is saved and logged with who did it'
);

select * from finish();
rollback;
