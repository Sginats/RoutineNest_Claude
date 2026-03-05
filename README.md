# RoutineNest

A PWA / Capacitor-based routine helper app for children who benefit from visual schedules and AAC communication support. Built with Next.js 15, Supabase, and Tailwind CSS.

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- (Optional) A [PostHog](https://posthog.com) project for analytics

---

## Setup

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
NEXT_PUBLIC_POSTHOG_KEY=<your-posthog-project-key>
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

---

## Supabase Storage Setup

Create a storage bucket named:

```
card-icons
```

This bucket stores uploaded icons for custom routine cards.

---

## Authentication

Kid Mode pages (`/kid/*`) require the parent to be logged in on the device.

This ensures all routine data is protected by Supabase Row-Level Security (RLS).
The `ParentGate` component prevents children from accessing parent settings.

---

## Running the app

### Web (development)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Web (production build)

```bash
npm run build   # generates static export in out/
npm run start
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

## Linting

```bash
npm run lint
```

---

## Third-party notices

- **ARASAAC pictograms** used in the icon picker are licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — non-commercial use only. Pictograms © Gobierno de Aragón / [arasaac.org](https://arasaac.org).
