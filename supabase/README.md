# supabase

The database: tables, access rules (row level security) and functions, as migrations
that run in order. The same migrations build the local database, the CI database and
the live Supabase project.

```
config.jsonc      settings for the local Supabase stack (made by `supabase init`)
migrations/       one change per file, named <date and time>_<what it does>.sql
tests/database/   pgTAP tests of the access rules, run against a real local database
scripts/          one-time scripts, run by hand (e.g. the first super admin)
```

## Working on it

Needs Docker. From the repository root:

```bash
npx supabase db start     # start a local Postgres with the Supabase schemas
npx supabase db reset     # rebuild it from the migrations
npx supabase test db      # run the tests in tests/database
npx supabase migration new <what_it_does>   # start a new migration file
```

## Rules for every table

- Plural snake_case names, `id uuid primary key default public.uuid_v7()`, times as `timestamptz` ending in `_at`.
- Nothing is granted to the API automatically. Each migration says what `authenticated`
  (and, rarely, `anon`) may do, starting with `revoke all ... from anon, authenticated`.
- Row level security is on for every table. A table without rules is unreachable through the API,
  like `audit_log`.
- Role checks go through `public.has_role(role, scope_id)`, `public.is_super_admin()` and
  `public.is_platform_manager()`.
- Every rule gets a test in `tests/database`: who can and who cannot.

## The first super admin

1. Sign up in the app.
2. Run [scripts/make_super_admin.sql](scripts/make_super_admin.sql) in the Supabase SQL Editor with your email.
