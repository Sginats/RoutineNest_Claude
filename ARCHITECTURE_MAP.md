# RoutineNest — Architecture Map

## Architecture Overview

RoutineNest is a **client-first, offline-capable** web/mobile app built with Next.js static export and Supabase.

- No server-side rendering. All pages are statically exported.
- The Supabase client is nullable — the app builds cleanly without env vars.
- TanStack Query manages all remote state with IndexedDB persistence for offline use.
- Capacitor wraps the web app for native Android and iOS distribution.

---

## System Layers

### UI Layer
- **Next.js App Router** pages in `src/app/`.
- Kid-facing pages use `src/components/kid/` (KidShell, BigTileButton, EmptyState).
- Parent pages use shadcn/ui components.
- `ThemeProvider` applies Playful (default) or Calm (`.calm` class) theme.

### State Layer
- **TanStack Query** (`@tanstack/react-query`) for all server state.
- Query cache persisted to IndexedDB via `idb-keyval` (`src/lib/queryPersistence.ts`).
- Settings state managed via `src/lib/settingsHooks.ts`.
- Subscription state via `src/lib/subscriptionHooks.ts`.

### Data Layer
- **Supabase** (Postgres + Auth + Storage).
- DB helpers in `src/lib/db.ts` (profiles, schedule, cards) and `src/lib/studyDb.ts` (curriculum).
- Storage helpers in `src/lib/storage.ts` (card icon images).
- Types in `src/lib/types.ts` (core) and `src/lib/studyTypes.ts` (curriculum).

### Offline Layer
- Mutations queued in `routinenest_sync_queue` (localStorage) via `src/lib/syncQueue.ts`.
- Queue replays when connectivity returns.
- `OfflineBanner` component shows status to the user.
- Schedule, AAC, and study all function without internet.

### Platform Layer
- **Web / PWA** — static export deployed to Vercel or any static host.
- **Android / iOS** — Capacitor wraps the same web output.
- Native TTS via `@capacitor-community/text-to-speech`; falls back to Web Speech API.

---

## Data Flow

```
User action
  → React component (src/app/ or src/components/)
    → Custom hook (useAuth, useSubscription, settingsHooks, etc.)
      → TanStack Query (useQuery / useMutation)
        → DB/storage helper (src/lib/db.ts or studyDb.ts)
          → Supabase client (src/lib/supabaseClient.ts)
            → Supabase Postgres (RLS enforced)
```

Offline mutation path:

```
useMutation → onError → syncQueue.ts → localStorage queue
  → network reconnect → queue flush → Supabase
```

---

## Key Modules

### Auth
- `src/hooks/useAuth.ts` — Supabase session listener, exposes `user`.
- `src/app/login/page.tsx` — sign-in / create-account tabs.
- First-time login (no profiles) redirects to `/onboarding`.

### Profiles
- `src/lib/db.ts` — `getProfile()`, `updateProfile()`, `updateSubscriptionTier()`.
- Table: `profiles` (linked to `auth.users.id`).

### AAC Talk Board
- `src/app/kid/talk/page.tsx` — category cards + TTS.
- No subscription check — **always free**.
- Cards stored in `communication_cards` table.

### Schedule
- `src/app/kid/schedule/page.tsx` — daily routine grid.
- Tap-to-complete with offline sync queue support.
- Data in `schedule_items` table.

### Study System
- Entry: `src/app/kid/study/page.tsx` → subject → module → lesson → activity.
- Seed data: `src/lib/studySeedData.ts`.
- DB helpers: `src/lib/studyDb.ts`.
- Premium gating on subject/module/lesson pages via `useSubscription`.

### Activity Gameplay
- Components: `src/components/activities/` (TapCorrectActivity, VisualMatchingActivity, SequencingActivity).
- Gameplay data: `src/lib/activityGameplayData.ts` (keyed by activity ID).
- Router: `ActivityGameplay` component inside `LessonActivitiesClient.tsx` selects component by type.

### Rewards
- `src/app/kid/rewards/page.tsx` — stars, streak, badges.
- Progress stored in `child_progress` table.
- Streak computed from consecutive days with completed activities.

### Subscription
- Tier field: `profiles.subscription_tier` (`free` | `premium`).
- Hooks: `useSubscription(userId)`, `useIsPremium(userId)`, `useUpdateSubscription(userId)`.
- `UpgradeBanner` component shown for free users on premium-gated pages.
- Stripe integration **not yet implemented**.

### Offline Sync
- `src/lib/syncQueue.ts` — enqueue / flush helpers.
- `src/lib/queryPersistence.ts` — TanStack Query + IndexedDB adapter.
- `src/components/OfflineBanner.tsx` — UI indicator.

---

## Directory Responsibilities

| Directory | Purpose |
| --- | --- |
| `src/app/` | Next.js App Router pages and layouts |
| `src/app/kid/` | All child-facing pages |
| `src/app/parent/` | All parent-facing pages |
| `src/components/` | Shared React components |
| `src/components/kid/` | Kid-specific layout components (KidShell, BigTileButton, EmptyState) |
| `src/components/activities/` | Interactive activity gameplay components |
| `src/components/study/` | Study-related display components |
| `src/components/ui/` | shadcn/ui primitives |
| `src/hooks/` | Global React hooks (useAuth) |
| `src/lib/` | Business logic, DB helpers, types, utilities |
| `supabase/migrations/` | Sequential Postgres migration files |
| `public/` | Static assets (icons, manifest, splash screens) |

---

## Activity Gameplay Architecture

Activity rendering is driven by the `activity_type` field on the `Activity` record.

```
LessonActivitiesClient.tsx
  → ActivityGameplay component
    → switch(activity.activity_type)
        "tap_correct"       → TapCorrectActivity
        "visual_matching"   → VisualMatchingActivity
        "sequencing"        → SequencingActivity
        all other types     → Instructions + Done button fallback
```

Gameplay data (questions, options, images) is stored separately in `activityGameplayData.ts` and looked up by `activity.id`.

---

## Offline Architecture

```
TanStack Query cache
  ↕ persisted to IndexedDB (idb-keyval, queryPersistence.ts)

Mutations
  → attempt Supabase write
  → on failure: enqueue in routinenest_sync_queue (localStorage)

On reconnect
  → syncQueue.ts flushes queued mutations → Supabase
```

- Schedule, AAC, and study content all read from cache when offline.
- Mutations that fail while offline are replayed in order on reconnect.
- Conflict resolution is last-write-wins.

---

## Subscription Architecture

```
profiles.subscription_tier ('free' | 'premium')
  ↓
useSubscription(userId)  →  { tier, isLoading }
useIsPremium(userId)     →  boolean

Study pages:
  isLoading → spinner
  !isPremium → UpgradeBanner (parent area only)
  isPremium → full content

AAC Talk page: NO subscription check (always free)
Kid-facing pages: NO subscription check (paywalls only in parent area)
```

---

## Security Model

- **Supabase RLS** is enabled on every table.
- Every policy uses `auth.uid()` to scope rows to the authenticated user.
- The Supabase anon key is a publishable client-side key — security relies entirely on RLS.
- Child identifiers are **never** sent to analytics.
- No secrets are stored in client code or committed to the repository.

---

## Important Architectural Constraints

- Static export only — no server-side rendering, no API routes.
- Supabase client is nullable — all consumers must handle `null`.
- AAC pages must never have a subscription check.
- Child-facing pages must never show paywalls or subscription prompts.
- All new Supabase tables must have RLS policies before use.
- Offline functionality must not regress — test after any data-layer change.
- Do not switch from npm to pnpm or yarn.
- All new files must be TypeScript (`.ts` / `.tsx`).
