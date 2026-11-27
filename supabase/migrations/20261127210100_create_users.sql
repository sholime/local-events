-- Profiles of everyone with an account.
--
-- Supabase Auth keeps the login itself (email, password, Google) in auth.users.
-- This table keeps what the app shows and needs, one row per auth user, with the same id.
-- A row is made automatically when someone signs up (see handle_new_auth_user below).
-- Deleting the auth user deletes the profile. Tables added later (results, reservations)
-- keep their rows and only lose the link, so tournaments stay complete.

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text not null check (char_length(display_name) between 1 and 80),
  language text not null default 'sr' check (language in ('sr', 'en')),
  -- When the person accepted the privacy notice. The sign-up form sends it; Google sign-in
  -- cannot, so it can be empty at first and the app asks for it before anything else.
  privacy_accepted_at timestamptz,
  -- Set by a super admin or platform manager. A blocked user can still log in and read,
  -- but cannot reserve or sign up for events (enforced where those tables are added).
  is_blocked boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.users is 'One profile per account, same id as auth.users.';

-- Makes the profile when someone signs up. The sign-up form sends the name, language
-- and privacy acceptance as user metadata, e.g.
--   {"display_name": "Ana Jović", "language": "sr", "privacy_accepted_at": "2026-11-27T19:30:00Z"}
-- Google sign-in sends "full_name" instead of "display_name".
create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.users (id, email, display_name, language, privacy_accepted_at)
  values (
    new.id,
    new.email,
    left(coalesce(nullif(trim(meta ->> 'display_name'), ''), nullif(trim(meta ->> 'full_name'), ''), split_part(new.email, '@', 1), 'Guest'), 80),
    case when meta ->> 'language' in ('sr', 'en') then meta ->> 'language' else 'sr' end,
    (meta ->> 'privacy_accepted_at')::timestamptz
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Access through the API. Nothing is granted automatically (that option is off in the
-- Supabase project), so every table states here who may do what. Row level security
-- then decides which rows.
revoke all on table public.users from anon, authenticated;
grant select on table public.users to authenticated;
-- People may change only their own name, language and privacy acceptance;
-- blocking goes through set_user_blocked().
grant update (display_name, language, privacy_accepted_at) on table public.users to authenticated;

alter table public.users enable row level security;
