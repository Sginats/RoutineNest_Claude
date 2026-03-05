# RoutineNest

A PWA / Capacitor-based routine helper app for children who benefit from visual schedules and AAC communication support. Built with Next.js 16, Supabase, and Tailwind CSS.

## Features

- **Visual Schedule** — Big tile grid for daily routines with clear done states
- **AAC Talk Board** — Tap-to-speak communication cards with text-to-speech
- **Star Rewards** — Earn stars by completing schedule items
- **Parent Lock** — Hold-to-enter gate protects parent areas
- **Calm Mode** — Muted colours, reduced motion for sensory comfort
- **Offline Support** — Works without internet; syncs when reconnected
- **PWA + Capacitor** — Install as a web app or build for Android/iOS

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- (Optional) A [PostHog](https://posthog.com) project for analytics

---

## Quick Start

### 1. Clone and install dependencies

```bash
git clone https://github.com/Sginats/RoutineNest_Claude.git
cd RoutineNest_Claude
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Optional — leave blank to disable analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

> **Note:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` is a publishable client-side key — safe to expose in the browser. Security relies on Supabase Row-Level Security (RLS) policies.

### 3. Run the database migration

Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) for your project and paste the contents of **`supabase/schema.sql`**, then click **Run**.

This creates all tables, triggers, indexes, RLS policies, and the `card-icons` storage bucket in a single idempotent script.

Alternatively, if you use the Supabase CLI:

```bash
supabase db reset   # applies all files in supabase/migrations/ in order
```

The incremental migration files in `supabase/migrations/` are:

| File | Description |
|------|-------------|
| `20260305000000_initial_schema.sql` | Core tables, triggers, RLS |
| `20260305000001_add_grid_size_sound.sql` | `grid_size` + `sound_enabled` columns |
| `20260305000002_add_card_tts_position.sql` | `tts_text` + `position` columns |
| `20260305000003_card_icons_bucket.sql` | `card-icons` storage bucket + policies |

### 4. Storage bucket

The app stores custom card icons in a Supabase Storage bucket named **`card-icons`**.

The `supabase/schema.sql` migration creates this bucket automatically. If you apply migrations individually, run `20260305000003_card_icons_bucket.sql` last.

Bucket settings:
- **Name:** `card-icons`
- **Public:** yes (image URLs are served without signed authentication tokens; the app screens themselves require an authenticated session)
- **File path format:** `{userId}/{timestamp}-{random}.{ext}`

The `{userId}` prefix is intentional: Supabase RLS storage policies can match
`auth.uid()::text` against the first path segment so that only the owning user
can upload or delete their own icons.

### 5. Create a Supabase user

In the Supabase dashboard → Authentication → Users, create an email/password user. This will be the parent account.

---

## Running the App

### Web (development)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Testing on a phone (same network):**

```bash
npm run dev -- --hostname 0.0.0.0
```

Then open `http://<your-computer-ip>:3000` on your phone's browser.

### Web (production build)

```bash
npm run build   # generates static export in out/
npx serve out   # or any static file server
```

### Mobile (Capacitor)

Build the static web output and copy it to the native projects:

```bash
npm run cap:build   # runs next build --webpack && npx cap copy
```

Then open in Android Studio or Xcode:

```bash
npm run cap:open:android
npm run cap:open:ios
```

Or run directly on a connected device / emulator:

```bash
npm run cap:run:android
npm run cap:run:ios
```

Sync Capacitor plugins after adding new npm packages:

```bash
npm run cap:sync
```

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_POSTHOG_KEY` (optional)
   - `NEXT_PUBLIC_POSTHOG_HOST` (optional)
4. Deploy. Vercel auto-detects Next.js and builds with `next build`.

> **Note:** The `output: "export"` setting in `next.config.ts` produces a fully static site. Vercel serves it as static files — no server-side rendering cost.

---

## PWA Install Test

1. Open the deployed URL in Chrome (desktop or Android) or Safari (iOS).
2. Look for the install prompt (Chrome: address bar install icon; Safari: Share → Add to Home Screen).
3. Install and verify the app launches in standalone mode (no browser chrome).
4. Go offline (airplane mode) and verify the app shell still loads with cached data.

---

## Authentication

Kid Mode pages (`/kid/*`) require the parent to be logged in on the device.

This ensures all routine data is protected by Supabase Row-Level Security (RLS).
The `ParentGate` component prevents children from accessing parent settings.

---

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Calm Mode | Muted colours, no animations | Off |
| Grid Size | Number of columns (2, 3, or 4) | 3 |
| Sound | Enable/disable TTS and audio | On |
| Analytics | Anonymous usage analytics (PostHog) | On |

All settings are per-profile and stored in Supabase. The analytics preference is stored in localStorage.

---

## Linting

```bash
npm run lint
```

---

## Privacy & Terms

- [Privacy Policy](./PRIVACY.md)
- [Terms of Use](./TERMS.md)

---

## Third-party Notices

- **ARASAAC pictograms** used in the icon picker are licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — **non-commercial use only**. Pictograms © Gobierno de Aragón / [arasaac.org](https://arasaac.org). If you use RoutineNest commercially, you must provide your own icon assets instead of ARASAAC pictograms.
