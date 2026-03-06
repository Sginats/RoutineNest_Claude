# RoutineNest — Repo Snapshot

Last updated: 2026-03-06

## Current State

This repo has completed STEP 16 — Subscription/paywall system.

## Directory Structure

```
/
├── PROJECT_CONTEXT.md
├── LLM_RULES.md
├── REPO_SNAPSHOT.md
├── CONTRIBUTING.md
├── supabase/
│   └── migrations/
│       ├── 20260305000000_initial_schema.sql
│       ├── 20260305000001_add_grid_size_sound.sql
│       ├── 20260305000002_add_card_tts_position.sql
│       ├── 20260305000003_card_icons_bucket.sql
│       ├── 20260305000004_study_plan_tables.sql
│       ├── 20260305000005_weekly_plan_entries.sql
│       └── 20260305000006_subscription_tier.sql   ← STEP 16
└── src/
    ├── app/
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── providers.tsx
    │   ├── page.tsx
    │   ├── debug-env/page.tsx
    │   ├── login/page.tsx
    │   ├── settings/page.tsx
    │   ├── parent/
    │   │   ├── page.tsx                      (+ subscription status banner)
    │   │   ├── study/page.tsx
    │   │   ├── study/progress/page.tsx
    │   │   └── subscription/page.tsx         ← STEP 16
    │   └── kid/
    │       ├── schedule/page.tsx
    │       ├── talk/page.tsx
    │       ├── rewards/page.tsx
    │       └── study/
    │           ├── page.tsx
    │           ├── subject/[subjectId]/      (+ premium gate)
    │           ├── module/[moduleId]/        (+ premium gate)
    │           └── lesson/[lessonId]/        (+ premium gate)
    ├── components/
    │   ├── ErrorBoundary.tsx
    │   ├── IconPicker.tsx
    │   ├── NavBar.tsx
    │   ├── OfflineBanner.tsx
    │   ├── ParentGate.tsx
    │   ├── ThemeProvider.tsx
    │   ├── UpgradeBanner.tsx                 ← STEP 16
    │   ├── kid/ (KidShell, BigTileButton, EmptyState)
    │   ├── study/ (StudyTile, LessonCard, BreakCard, ProgressBar, RewardStars, SubjectBadge)
    │   └── ui/ (button, card, input, label, switch)
    ├── hooks/
    │   └── useAuth.ts
    └── lib/
        ├── analytics.ts
        ├── db.ts                             (+ getProfile, updateSubscriptionTier)
        ├── env.ts
        ├── profileStore.ts
        ├── queryPersistence.ts
        ├── settingsHooks.ts
        ├── speak.ts
        ├── storage.ts
        ├── studyDb.ts
        ├── studySeedData.ts
        ├── studyTypes.ts
        ├── supabaseClient.ts
        ├── subscriptionHooks.ts              ← STEP 16
        ├── syncQueue.ts
        ├── tts.ts
        ├── types.ts                          (+ SubscriptionTier, ProfilePatch)
        └── utils.ts
```

## Stack

| Layer        | Technology                              |
| ------------ | --------------------------------------- |
| Framework    | Next.js (App Router) + TypeScript       |
| Styling      | Tailwind CSS + shadcn/ui               |
| Backend      | Supabase (Auth, Postgres, Storage)      |
| Data         | TanStack Query                          |
| Offline      | PWA + query cache persistence           |
| TTS          | Capacitor plugin + Web Speech API       |
| Mobile       | Capacitor (Android / iOS)               |
| Analytics    | PostHog (opt-out, no session replay)    |
| Package mgr  | npm                                     |

## Completed Steps

- [x] STEP 0 — Add grounding files (PROJECT_CONTEXT, LLM_RULES, REPO_SNAPSHOT, CONTRIBUTING)
- [x] STEP 1 — Scaffold Next.js app with TypeScript and Tailwind
- [x] STEP 7 — DB schema, auth, RLS
- [x] STEP 9 — Settings page (calm mode, grid size, sound)
- [x] STEP 10 — Parent dashboard (profiles, selection)
- [x] STEP 12 — Kid Schedule MVP (read + tap done)
- [x] STEP 15 — Parent MVP editors (Cards manager + Schedule builder)
- [x] STEP 16 — Subscription/paywall system
  - DB migration: `subscription_tier` column on profiles ('free' | 'premium')
  - `subscriptionHooks.ts`: `useSubscription`, `useIsPremium`, `useUpdateSubscription`
  - `db.ts`: `getProfile`, `updateSubscriptionTier` (offline-aware)
  - `types.ts`: `SubscriptionTier`, `ProfilePatch`
  - `/parent/subscription` page: tier selector, feature comparison, AAC-is-free reassurance
  - `UpgradeBanner` component: shown in kid study when premium content accessed
  - Parent dashboard: subscription status banner + Upgrade/Manage button
  - Premium gating in kid study pages: subject, module, and lesson pages show UpgradeBanner instead of content for free users
  - AAC Talk Board: never gated (always free)

## Architecture Notes

### Subscription Model
- Tier stored on `profiles.subscription_tier` (linked to `auth.users.id`)
- Free: basic routines, AAC talk board, visual schedule, rewards
- Premium: full study curriculum (premium subjects/modules/lessons), advanced learning plans, progress analytics
- AAC is **always free** — enforced in code (TalkPage has no subscription check)

## Next Steps

- [ ] STEP 17 — (TBD)
