-- Makes one person super admin. Run once by hand for the first super admin;
-- after that super admins give the role to others in the app.
--
-- The person must have signed up in the app first, so that their profile exists.
-- Run it in the Supabase dashboard (SQL Editor) after replacing the email below,
-- or with psql: psql "<connection string>" -v email=ana@example.com -f make_super_admin.sql
-- (then replace 'person@example.com' with :'email').
--
-- Done by hand in the database, so the audit log records it with no actor.

insert into public.role_assignments (user_id, role, scope_type, scope_id)
select id, 'super_admin', 'platform', null
from public.users
where email = 'person@example.com'
on conflict on constraint one_role_per_scope do nothing
returning user_id, role;
