# RoutineNest — Repo Snapshot

Last updated: 2026-03-06

## Current State

This repo has completed STEP 17 — Activity gameplay, onboarding, rewards & streaks, and kid home UX improvements.

## Directory Structure

```
/
├── AI_CONTEXT.md
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
│       └── 20260305000006_subscription_tier.sql
└── src/
    ├── app/
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── providers.tsx
    │   ├── page.tsx                            (5-tile kid home: Study, Talk, Schedule, Rewards, Break)
    │   ├── debug-env/page.tsx
    │   ├── login/page.tsx                      (+ first-time user → onboarding redirect)
    │   ├── onboarding/page.tsx                 ← STEP 17 (5-step wizard)
    │   ├── settings/page.tsx
    │   ├── parent/
    │   │   ├── page.tsx                        (+ subscription status banner)
    │   │   ├── study/page.tsx
    │   │   ├── study/progress/page.tsx
    │   │   └── subscription/page.tsx
    │   └── kid/
    │       ├── break/page.tsx                  ← STEP 17 (calm prompts + timer)
    │       ├── schedule/page.tsx
    │       ├── talk/page.tsx
    │       ├── rewards/page.tsx                (+ streaks, badges)
    │       └── study/
    │           ├── page.tsx
    │           ├── subject/[subjectId]/        (+ premium gate)
    │           ├── module/[moduleId]/          (+ premium gate)
    │           └── lesson/[lessonId]/          (+ interactive gameplay)
    ├── components/
    │   ├── ErrorBoundary.tsx
    │   ├── IconPicker.tsx
    │   ├── NavBar.tsx
    │   ├── OfflineBanner.tsx
    │   ├── ParentGate.tsx
    │   ├── ThemeProvider.tsx
    │   ├── UpgradeBanner.tsx
    │   ├── activities/                         ← STEP 17
    │   │   ├── TapCorrectActivity.tsx
    │   │   ├── VisualMatchingActivity.tsx
    │   │   ├── SequencingActivity.tsx
    │   │   └── index.ts
    │   ├── kid/ (KidShell, BigTileButton, EmptyState)
    │   ├── study/ (StudyTile, LessonCard, BreakCard, ProgressBar, RewardStars, SubjectBadge)
    │   └── ui/ (button, card, input, label, switch)
    ├── hooks/
    │   └── useAuth.ts
    └── lib/
        ├── activityGameplayData.ts             ← STEP 17
        ├── analytics.ts
        ├── db.ts
        ├── env.ts                              (safe for prerender — no throw)
        ├── profileStore.ts
        ├── queryPersistence.ts
        ├── settingsHooks.ts
        ├── speak.ts
        ├── storage.ts
        ├── studyDb.ts
        ├── studySeedData.ts
        ├── studyTypes.ts
        ├── supabaseClient.ts                   (nullable — returns null without env vars)
        ├── subscriptionHooks.ts
        ├── syncQueue.ts
        ├── tts.ts
        ├── types.ts
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
- [x] STEP 17 — Activity gameplay, onboarding, rewards & kid home improvements
  - Build fix: `env.ts` no longer throws during prerender; `supabaseClient.ts` returns null without env vars
  - Kid home: 5-tile grid layout (Study, Talk, Schedule, Rewards, Break)
  - Break page: calm prompts, break timer, "I'm Ready" return
  - Onboarding wizard: 5-step flow (name → class level → subjects → session length → intensity)
  - Login: first-time users redirected to `/onboarding` when no profiles exist
  - Activity gameplay: 3 interactive types (TapCorrect, VisualMatching, Sequencing)
  - `activityGameplayData.ts`: pre-built gameplay data for seed activities
  - Rewards page: streak counter, 7 earnable badges (star + streak thresholds)

## Architecture Notes

### Subscription Model
- Tier stored on `profiles.subscription_tier` (linked to `auth.users.id`)
- Free: basic routines, AAC talk board, visual schedule, rewards
- Premium: full study curriculum (premium subjects/modules/lessons), advanced learning plans, progress analytics
- AAC is **always free** — enforced in code (TalkPage has no subscription check)

### Activity System
- Activity types: `tap_correct`, `visual_matching`, `sequencing`, `listen_choose`, `speak_tap_aac`, `trace`, `parent_guided`, `routine_checkoff`, `printable`
- Interactive gameplay implemented for: `tap_correct`, `visual_matching`, `sequencing`
- Other types fall back to a simple "Done" button with instructions
- Gameplay data defined in `activityGameplayData.ts` keyed by activity ID
- Components in `src/components/activities/`

### Build
- `env.ts` exports env vars without throwing — safe for static export / prerendering
- `supabaseClient.ts` returns `null` when env vars are missing — all consumers handle null

## Next Steps

- [ ] STEP 18 — Payment integration (Stripe)
- [ ] STEP 19 — Additional activity gameplay types (listen_choose, trace)
- [ ] STEP 20 — Weekly planner UI for parents
- [ ] STEP 21 — A/B testing with PostHog feature flags
