# Molare Commerce

Luxury men's fashion e-commerce built with Next.js, TypeScript, Tailwind CSS, Supabase, and signed session cookies.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
AUTH_SESSION_SECRET=
```

Set all three variables in Netlify before deploying. `AUTH_SESSION_SECRET` signs the `molare_session` cookie; changing it invalidates existing sessions and logs users out.

## Auth Migration

If an existing Supabase `users` table still contains legacy plaintext password values, run the password hash migration before dropping the legacy column:

```bash
npm run db:migrate-passwords
```

After confirming every user has `password_hash` populated and login works, run this SQL in Supabase:

```sql
alter table public.users drop column if exists password;
```

## Deploy

The deployment target is Netlify:

1. Push this project to a GitHub repository.
2. Import the repository in Netlify.
3. Use the default settings:
   - Framework: Next.js
   - Build command: `npm run build`
   - Install command: `npm install`
