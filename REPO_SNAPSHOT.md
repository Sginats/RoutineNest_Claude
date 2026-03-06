# RoutineNest — Repo Snapshot

Last updated: 2026-03-06

## Current State

Completed through STEP 17 — Activity gameplay, onboarding, rewards & streaks, and kid home UX improvements.

## Directory Structure

```
/
├── AI_CONTEXT.md
├── PROJECT_SUMMARY.md
├── ARCHITECTURE_MAP.md
├── REPO_SNAPSHOT.md
├── CONTRIBUTING.md
├── CONTENT_SYSTEM.md
├── AGENT_TASKS.md
├── SYSTEM_PROMPT.md
├── PRIVACY.md
├── TERMS.md
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
    │   ├── onboarding/page.tsx                 (5-step wizard)
    │   ├── settings/page.tsx
    │   ├── parent/
    │   │   ├── page.tsx                        (+ subscription status banner)
    │   │   ├── study/page.tsx                  (+ ParentGate, weekly planner)
    │   │   ├── study/progress/page.tsx         (+ ParentGate)
    │   │   └── subscription/page.tsx
    │   └── kid/
    │       ├── break/page.tsx                  (calm prompts + timer)
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
    │   ├── activities/
    │   │   ├── TapCorrectActivity.tsx
    │   │   ├── VisualMatchingActivity.tsx
    │   │   ├── SequencingActivity.tsx
    │   │   ├── ListenChooseActivity.tsx
    │   │   ├── SpeakTapAacActivity.tsx
    │   │   └── index.ts
    │   ├── kid/ (KidShell, BigTileButton, EmptyState)
    │   ├── study/ (StudyTile, LessonCard, BreakCard, ProgressBar, RewardStars, SubjectBadge)
    │   └── ui/ (button, card, input, label, switch)
    ├── hooks/
    │   └── useAuth.ts
    └── lib/
        ├── activityGameplayData.ts
        ├── analytics.ts
        ├── billing.ts
        ├── db.ts
        ├── env.ts                              (safe for prerender — no throw)
        ├── profileStore.ts
        ├── queryPersistence.ts
        ├── settingsHooks.ts
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

## Implemented Systems

| System | Status |
| --- | --- |
| Auth + login | ✅ Complete |
| Onboarding wizard | ✅ Complete |
| Kid home hub (5-tile grid) | ✅ Complete |
| Visual schedule | ✅ Complete |
| AAC Talk Board (always free) | ✅ Complete |
| Study curriculum + seed data | ✅ Complete |
| Activity gameplay (5 types) | ✅ Complete |
| Rewards + streaks + badges | ✅ Complete |
| Break page | ✅ Complete |
| Parent dashboard | ✅ Complete |
| Subscription model (free/premium) | ✅ Complete |
| Offline sync (PWA + IDB) | ✅ Complete |
| Capacitor mobile wrapper | ✅ Complete |
| PostHog analytics | ✅ Complete |
| Theme system (Playful + Calm) | ✅ Complete |
| Stripe payment integration | ❌ Not started |
| Additional activity types | ❌ Not started |
| Weekly planner (parent study page) | ✅ Complete |

## Completed Steps

- [x] STEP 0 — Grounding files
- [x] STEP 1 — Scaffold Next.js app with TypeScript and Tailwind
- [x] STEP 7 — DB schema, auth, RLS
- [x] STEP 9 — Settings page (calm mode, grid size, sound)
- [x] STEP 10 — Parent dashboard (profiles, selection)
- [x] STEP 12 — Kid Schedule MVP (read + tap done)
- [x] STEP 15 — Parent MVP editors (Cards manager + Schedule builder)
- [x] STEP 16 — Subscription/paywall system
- [x] STEP 17 — Activity gameplay, onboarding, rewards & kid home improvements

## Database Migrations

| File | Description |
| --- | --- |
| `20260305000000_initial_schema.sql` | Core tables, triggers, RLS |
| `20260305000001_add_grid_size_sound.sql` | `grid_size` + `sound_enabled` columns |
| `20260305000002_add_card_tts_position.sql` | `tts_text` + `position` columns |
| `20260305000003_card_icons_bucket.sql` | `card-icons` storage bucket + policies |
| `20260305000004_study_plan_tables.sql` | Study plan tables |
| `20260305000005_weekly_plan_entries.sql` | Weekly plan entries table |
| `20260305000006_subscription_tier.sql` | `subscription_tier` column on profiles |

## Architecture Notes

### Subscription Model

- Tier stored on `profiles.subscription_tier` (linked to `auth.users.id`).
- Free: basic routines, AAC talk board, visual schedule, rewards.
- Premium: full study curriculum, advanced learning plans, progress analytics.
- AAC is **always free** — enforced in code (TalkPage has no subscription check).

### Activity System

- Activity types: `tap_correct`, `visual_matching`, `sequencing`, `listen_choose`, `speak_tap_aac`, `trace`, `parent_guided`, `routine_checkoff`, `printable`.
- Interactive gameplay implemented for: `tap_correct`, `visual_matching`, `sequencing`, `listen_choose`, `speak_tap_aac`.
- Other types (`trace`, `parent_guided`, `routine_checkoff`, `printable`) fall back to a simple "Done" button with instructions.
- Gameplay data defined in `activityGameplayData.ts` keyed by activity ID.
- Components in `src/components/activities/`.

### Build

- `env.ts` exports env vars without throwing — safe for static export / prerendering.
- `supabaseClient.ts` returns `null` when env vars are missing — all consumers handle null.
- Build command: `npm run build` (uses `--webpack` flag for PWA plugin compatibility).

## Deployment Readiness

### Web (Vercel)

Ready to deploy. Static export via `output: "export"`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel project settings.

### Android / iOS (Capacitor)

Ready. Run `npm run cap:build`, then open in Android Studio / Xcode. Signing config and version bumps required before store submission.

### Pre-Release Checklist

- Verify RLS policies enabled on all tables.
- Confirm PostHog analytics opt-out works (localStorage key `routinenest_analytics_enabled`).
- Confirm no PII in analytics events.
- Confirm session replay disabled.
- Confirm `card-icons` bucket access is scoped to owning user.
- Grep for secrets — none should be in committed files.
- Test offline: schedule, AAC, study all load from cache; mutations queue and replay.
- Test accessibility: touch targets ≥ 48 px, focus order, screen reader labels, calm mode.
- Test parent lock: 3-second hold gate required on all /parent/* routes (dashboard, schedule, settings, study planner, progress, subscription). No route bypass.

## Known Limitations

- Stripe payment not yet integrated — subscription tier set manually in Supabase.
- 4 of 9 activity types (`trace`, `parent_guided`, `routine_checkoff`, `printable`) fall back to a simple "Done" button.
- No multi-parent invites or therapist portal.
- Conflict resolution is last-write-wins only.

## Next Steps

- [ ] Stripe payment backend integration (checkout, webhook, billing portal, subscription sync)
- [ ] Interactive gameplay for remaining activity types (trace, parent_guided)
- [ ] A/B testing with PostHog feature flags

---

## System Ownership

Maps each major system to its primary implementation files. Edit the listed files when modifying a system.

| System | Primary File(s) |
| --- | --- |
| Auth | `src/hooks/useAuth.ts` |
| Onboarding | `src/app/onboarding/page.tsx` |
| Kid Home | `src/app/page.tsx` |
| AAC Board | `src/app/kid/talk/page.tsx` |
| Schedule | `src/app/kid/schedule/page.tsx` |
| Study System | `src/app/kid/study/` |
| Activity Gameplay | `src/components/activities/`, `src/lib/activityGameplayData.ts` |
| Rewards | `src/app/kid/rewards/page.tsx` |
| Subscriptions | `src/lib/subscriptionHooks.ts`, `src/lib/db.ts` |
| Offline Sync | `src/lib/syncQueue.ts` |
| Parent Dashboard | `src/app/parent/page.tsx` |
| Settings | `src/app/settings/page.tsx` |
| Theme | `src/components/ThemeProvider.tsx` |

---

## Data Ownership

Maps database tables to their owning systems. All tables use **Supabase Row Level Security (RLS)** — users can only read and write their own rows.

| Table | System | Description |
| --- | --- | --- |
| `profiles` | Auth / Subscriptions | Child profiles, subscription tier (`free` \| `premium`) |
| `communication_cards` | AAC Board | AAC phrase cards with icon, label, TTS text, position |
| `schedule_items` | Schedule | Visual routine schedule entries |
| `child_progress` | Study / Rewards | Activity completion records; used for streak calculation |
| `weekly_plan_entries` | Study System | Parent-configured weekly study plan |
| `study_subjects` | Study System | Subject areas (seeded from `studySeedData.ts`) |
| `study_modules` | Study System | Curriculum modules per subject |
| `study_lessons` | Study System | Lessons within a module |
| `study_activities` | Study System | Individual activities within a lesson |

> All mutations that fail offline are queued in IndexedDB (`syncQueue.ts`) and replayed when connectivity is restored.

---

## Runtime Constraints

These rules govern how the app is built and deployed. **Do not violate them.**

- **Static export only** — `next.config.ts` sets `output: "export"`. No server-side rendering.
- **No API routes** — there is no `app/api/` directory. All data operations go through Supabase directly.
- **No SSR** — all data fetching happens client-side via React Query + Supabase JS SDK.
- **Supabase is the only backend** — auth, database, storage, and realtime all use Supabase.
- **Supabase client may be null** — `supabaseClient.ts` returns `null` when env vars are absent (e.g., during CI builds). Every consumer must null-check before use.
- **Build command** — `npm run build` (passes `--webpack` for PWA plugin compatibility).

---

## Performance Goals

Design and implementation decisions must respect these targets:

- **Touch targets ≥ 48 px** — all interactive elements meet minimum tap size for kids.
- **Low animation / sensory safety** — avoid rapid motion; respect `calm` theme setting.
- **Fast initial load** — static export enables CDN-level caching; keep bundle size lean.
- **Offline-first** — schedule, AAC board, and study content load from IndexedDB cache; mutations queue and replay via `syncQueue.ts`.
- **Accessible** — focus order, screen-reader labels, and high-contrast are required in all new UI.

---

## AI Context

Before implementing any change, AI agents **must** read these files in order:

1. `AI_CONTEXT.md` — persistent AI memory, conventions, and constraints
2. `PROJECT_SUMMARY.md` — project goals, audience, and feature overview
3. `ARCHITECTURE_MAP.md` — system architecture and data-flow diagrams
4. `REPO_SNAPSHOT.md` — current repo state, ownership maps, and runtime rules (this file)

Skipping these files risks violating runtime constraints or duplicating existing systems.
