# @local-events/web

The Local Events web app: Next.js (App Router), installable on phones as a PWA.

- Sign-in with Supabase Auth: an emailed one-time link, or Google.
- UI text lives only in `messages/sr.json` and `messages/en.json` (same keys in both, checked by a test).
  The language comes from the picker (saved in a cookie), then the browser, then Serbian.
- `src/lib/supabase/` has the Supabase clients for the server, the browser and the proxy
  (`src/proxy.ts`, which keeps the sign-in fresh on each request).

## Run locally

```sh
npx supabase start            # in the repository root; needs Docker
cp apps/web/.env.example apps/web/.env.local
# put PUBLISHABLE_KEY from `npx supabase status` into .env.local
npm run dev                   # http://127.0.0.1:3000
```

Sign-in emails go to the local mail viewer at http://127.0.0.1:54324.

## Live Supabase project settings

Authentication → URL Configuration:

- **Site URL**: the app's address (for example the Vercel URL).
- **Redirect URLs**: `<app address>/**`, and `http://127.0.0.1:3000/**` for local work.

Google sign-in: create an OAuth client in Google Cloud (type "Web application", redirect URI
`https://<project-ref>.supabase.co/auth/v1/callback`), then enter its client ID and secret under
Authentication → Sign In / Providers → Google.
