# Kotobox — account service (Supabase) setup

Written 2026-07-19, after diagnosing the "Failed to fetch" error on the register page:
the Supabase project this app pointed at (`rrbebdowcgrlryraxkad.supabase.co`) **no longer
resolves in DNS** — it was deleted or expired. Nothing is wrong with the app code; every
auth call fails at the network layer because the server is gone. Follow the steps below
once and email/password auth, Google sign-in, and the welcome email all come to life.

## 1. Restore or recreate the Supabase project

1. Log in at [supabase.com/dashboard](https://supabase.com/dashboard).
2. If the old project is listed as *paused*, restore it and skip to step 5.
   If it's gone, create a new project (any region close to you; free tier is fine).
3. In the new project: **Project Settings → API**. Copy the **Project URL** and the
   **anon/public key**.
4. Update `.env` in the repo root:

   ```
   VITE_SUPABASE_URL=https://<your-new-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-new-anon-key>
   ```

   Also update the same two variables in **Vercel → Project → Settings →
   Environment Variables**, then redeploy (the deployed site bakes them in at build).
5. Restart the dev server (`npm run dev`) — Vite only reads `.env` at startup.

## 2. Recreate the progress-sync table

The app syncs learner progress to a `user_progress` table
(see `src/lib/progressSync.ts`). In **SQL Editor**, run:

```sql
create table if not exists public.user_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  progress jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

create policy "Users can read own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);
```

## 3. Enable Google sign-in

The app already has the button and the `/auth/callback` landing page; Supabase just
needs the provider switched on.

1. In [Google Cloud Console](https://console.cloud.google.com/) create (or reuse) a
   project → **APIs & Services → Credentials → Create credentials → OAuth client ID**,
   type **Web application**.
   - You'll be asked to configure the consent screen first: External, app name
     "Kotobox", your email; no extra scopes needed.
   - **Authorized redirect URI** (this is the important one):
     `https://<your-new-ref>.supabase.co/auth/v1/callback`
2. Copy the client ID and client secret into **Supabase → Authentication →
   Sign In / Providers → Google**, and enable the provider.
3. In **Supabase → Authentication → URL Configuration**:
   - **Site URL**: your production URL (the Vercel domain).
   - **Redirect URLs**: add both
     `http://localhost:5173/auth/callback` and
     `https://<your-vercel-domain>/auth/callback`.

Flow after that: button → Google → back to `/auth/callback` → progress sync →
`/dashboard`. Google-created accounts need no email confirmation (Google already
verified the address), so they land straight on the dashboard.

## 4. Welcome email

Supabase sends the signup confirmation email; we brand it so it doubles as the
welcome email. In **Supabase → Authentication → Emails → Confirm signup**:

- Subject: `Welcome to Kotobox — confirm your email`
- Body: paste the full contents of
  [`docs/email-templates/welcome-confirm-signup.html`](email-templates/welcome-confirm-signup.html).

The template shows the visitor's login email and a confirm button in the Living Ink
style. **It deliberately does not contain the password**: email is stored in plaintext
in inboxes, so mailing credentials would hand the account to anyone who ever gets into
that inbox — and Supabase (correctly) never exposes the password after signup anyway.
The template says this in-line so users aren't left hunting for it.

Note: Supabase's built-in mailer is fine for development but rate-limited (a handful
of emails per hour) and sends from `noreply@mail.app.supabase.io`. Before real users
arrive, plug in custom SMTP (**Authentication → Emails → SMTP Settings**) with a
provider like Resend — the template works unchanged.

## 5. Verify

1. `npm run dev`, open `http://localhost:5173/register`.
2. Register with a real email → the branded email arrives → confirm → log in →
   dashboard shows your progress.
3. Log out, hit **Continue with Google** → Google consent → dashboard.
