# local-events

Mobile-first web app that connects venues, events and guests: concerts with table reservations,
tournaments with brackets and results. The screens are in Serbian (Latin script) and English.

## How the code is organised

One repository with npm workspaces, so a change to the shared types, the database and the
screens lands in one pull request.

```
apps/
  web/            the Next.js app (PWA): public venue pages, venue panel, app admin panel (coming next)
packages/
  shared/         fixed lists of values, validation schemas (Zod) and sr/en labels, used by every app
supabase/         database tables, access rules (RLS) and functions (coming next)
tsconfig.base.json  TypeScript settings every package extends
```

## Working on it

```bash
npm install
npm run typecheck  # check types in every package
npm test           # run the tests in every package
```

## Conventions

Same as the OdorMap projects:

- Code, comments, commit messages and READMEs in English; on-screen text only in translation files (sr/en).
- Every file starts with a sentence or two on what it does; comments explain why, with an example value.
- Database: plural snake_case tables (`users`, `event_concerts`), snake_case columns, `id` as UUID v7,
  foreign keys `<table in singular>_id`, times as `timestamptz` ending in `_at`.
- JSON and TypeScript: camelCase; only the database layer converts from snake_case.
  Types and components in PascalCase, singular (`User`, `EventCard`); a Zod schema and its type share a name.
- Fixed values: a lowercase `as const` list in `packages/shared/src/enums.ts`, with labels in `labels.ts`.
- One branch and one pull request per feature, squash-merged; the PR title says what changes for the user.
