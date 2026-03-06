# Contributing to RoutineNest

## Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) project (free tier works)
- (Optional) A [PostHog](https://posthog.com) project for analytics

## Installation

```bash
git clone https://github.com/Sginats/RoutineNest_Claude.git
cd RoutineNest_Claude
npm install
```

## Environment Variables

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

> `NEXT_PUBLIC_SUPABASE_ANON_KEY` is a publishable client-side key — safe to expose in the browser. Security relies on Supabase Row-Level Security (RLS) policies.

### Building Without Supabase

The app builds successfully without environment variables. The Supabase client returns `null` and all consumers handle this gracefully. This enables CI/CD pipelines to build without secrets.

## Database Setup

Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) and run the migration files in `supabase/migrations/` in order. Alternatively:

```bash
supabase db reset   # applies all migration files in order
```

### Storage Bucket

The `card-icons` storage bucket is created by migration `20260305000003_card_icons_bucket.sql`. Bucket is public for image URLs; upload/delete scoped to owning user via RLS.

### Create a User

In Supabase dashboard → Authentication → Users, create an email/password user. This will be the parent account.

## Running the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Testing on a phone (same network):**

```bash
npm run dev -- --hostname 0.0.0.0
```

Then open `http://<your-computer-ip>:3000` on your phone.

## Building for Production

```bash
npm run build   # generates static export in out/
```

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Build for production (static export, uses `--webpack`) |
| `npm run lint` | Run ESLint |
| `npm run cap:build` | Build for Capacitor (web + copy to native) |
| `npm run cap:open:android` | Open Android project in Android Studio |
| `npm run cap:open:ios` | Open iOS project in Xcode |
| `npm run cap:run:android` | Run on Android device / emulator |
| `npm run cap:run:ios` | Run on iOS device / emulator |
| `npm run cap:sync` | Sync Capacitor plugins |

## Capacitor Mobile Workflow

Build the static web output and copy to native projects:

```bash
npm run cap:build
```

Open in Android Studio or Xcode:

```bash
npm run cap:open:android
npm run cap:open:ios
```

Run directly on a connected device / emulator:

```bash
npm run cap:run:android
npm run cap:run:ios
```

Sync Capacitor plugins after adding npm packages:

```bash
npm run cap:sync
```

## Deployment

### Web (Vercel)

1. Push repo to GitHub.
2. Import in [Vercel](https://vercel.com/new).
3. Set environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and optionally `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST`.
4. Deploy. Vercel auto-detects Next.js. Static export — no server-side rendering cost.

### Android

1. `npm run cap:build`
2. `npm run cap:open:android`
3. Set build variant to release, configure signing, bump `versionCode` / `versionName`.
4. Generate signed AAB and upload to Google Play Console.

### iOS

1. `npm run cap:build`
2. `npm run cap:open:ios`
3. Verify Bundle ID, signing certificate, version numbers.
4. Archive and upload to App Store Connect.

### PWA Install Test

1. Open deployed URL in Chrome or Safari.
2. Install via browser prompt or Share → Add to Home Screen.
3. Verify standalone mode and offline functionality.

## Development Guidelines

### Tools

- **Node + npm** — do not use pnpm or yarn.
- **Next.js App Router** — follow App Router conventions for all pages and layouts.
- **TypeScript** — all new files must be `.ts` / `.tsx`.

### Accessibility

RoutineNest is built for children with autism. Accessibility is not optional.

- Large touch targets (minimum 48 × 48 px).
- Predictable, consistent UI with no surprise sounds or animations.
- Support Calm Mode (reduced motion, softer colours).
- All images and icons must have meaningful alt text or aria labels.
- Test with screen readers when possible.

### Autism-Friendly Design

- Predictable layouts with consistent navigation.
- Minimal text — prefer icon + label pairs.
- Calm colour palette with no flashing or overstimulation.
- Clear next actions in every flow.
- Repetition-friendly learning activities.

### Code Style

- Follow existing patterns in the codebase.
- Use Tailwind CSS utility classes for styling.
- Use shadcn/ui components where available.
- Keep components small and focused.

### Adding Activities

1. Create a component in `src/components/activities/`.
2. Export it from `src/components/activities/index.ts`.
3. Add gameplay data in `src/lib/activityGameplayData.ts`.
4. Wire it up in the `ActivityGameplay` component in `LessonActivitiesClient.tsx`.

### Commits

- One logical change per commit.
- Use clear, descriptive commit messages.

## Testing

- Run `npm run build` before submitting a PR to ensure no TypeScript or build errors.
- Run `npm run lint` to check for linting issues.

### QA Checklist

Before release, verify:

- **Offline:** Schedule, AAC, study load from cache. Mutations queue and replay on reconnect.
- **Accessibility:** Touch targets ≥ 48 px, colour contrast meets WCAG AA, focus order logical, screen reader labels present.
- **Parent lock:** 3-second hold gate works, short tap rejected, no route bypass.
- **Calm mode:** Toggle applies immediately, animations removed, TTS still works, setting persists.
- **Performance:** Initial paint < 2 s on mid-range device, no jank on reorder, IDB sync queue does not grow unbounded.

## Reporting Issues

- Use GitHub Issues.
- Include steps to reproduce, expected behaviour, and actual behaviour.
- Screenshots or screen recordings are helpful.

## Code of Conduct

Be kind, inclusive, and respectful. This project serves children and families.
