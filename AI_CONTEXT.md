# AI Context — RoutineNest

> Persistent memory for AI coding agents. Read this file before every session.

## Project Summary

RoutineNest is a mobile-first visual study and routine-support platform for children with autism and similar support needs. Parents configure learning plans, schedules, and communication cards. Children interact with a simple, predictable, icon-driven interface.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth, Postgres, Storage) |
| Data | TanStack Query |
| Offline | PWA + IndexedDB query persistence + mutation sync queue |
| TTS | Capacitor plugin + Web Speech API fallback |
| Mobile | Capacitor (Android / iOS) |
| Analytics | PostHog (privacy-safe, opt-out, no session replay) |
| Icons | ARASAAC pictograms |
| Package manager | npm |

## Architecture Principles

- Next.js App Router conventions for all pages and layouts.
- Supabase Row Level Security on every table.
- Nullable Supabase client — builds succeed without env vars for CI.
- Offline-first: query cache persistence + queued mutations.
- Subscription tier stored on `profiles.subscription_tier` (`free` | `premium`).
- AAC communication is always free — no subscription check on Talk pages.
- Kid-facing components use `src/components/kid/` (KidShell, BigTileButton, EmptyState).
- Activity gameplay components live in `src/components/activities/`.
- Seed curriculum data in `src/lib/studySeedData.ts`.

## Product Rules (Non-Negotiable)

- AAC communication must always remain free.
- Never show paywalls in child-facing flows.
- Subscription prompts appear only in parent interfaces.
- All Supabase queries must respect Row Level Security.
- Offline functionality must always work.
- Never expose secrets in client code.
- Never send child identifiers to analytics.

## Autism-Friendly UX Rules

Kid-facing interfaces must follow:

- Large touch targets (minimum 48 × 48 px).
- Minimal text — prefer icon + label pairs.
- Predictable navigation with consistent layout.
- Calm colour palette (warm teal/coral default, muted blue calm mode).
- Minimal animation; calm mode disables all transitions.
- No flashing elements.
- Clear next actions in every flow.

## Current Development Stage

Completed through STEP 17. The platform has:

- Authentication (Supabase Auth, login/signup).
- Onboarding wizard (5-step parent flow).
- Kid home (5-tile grid: Study, Talk, Schedule, Rewards, Break).
- Visual schedule with tap-to-complete.
- AAC Talk Board with TTS.
- Study curriculum with seed data (Age → Class → Subject → Module → Lesson → Activity).
- Interactive activities (TapCorrect, VisualMatching, Sequencing).
- Rewards with streaks and 7 earnable badges.
- Break page with calm prompts and timer.
- Parent dashboard with study planner and progress tracking.
- Subscription model (free/premium) with UpgradeBanner gating.
- Offline-first PWA with query cache persistence.
- Capacitor mobile wrapper (Android/iOS).
- PostHog analytics integration.
- Theme system (Playful default + Calm mode).

## Major Systems Implemented

| System | Status |
| --- | --- |
| Auth + login | ✅ Complete |
| Onboarding wizard | ✅ Complete |
| Kid home hub | ✅ Complete |
| Visual schedule | ✅ Complete |
| AAC Talk Board | ✅ Complete (always free) |
| Study curriculum + seed data | ✅ Complete |
| Activity gameplay (3 types) | ✅ Complete |
| Rewards + streaks + badges | ✅ Complete |
| Break page | ✅ Complete |
| Parent dashboard | ✅ Complete |
| Subscription model | ✅ Complete |
| Offline sync | ✅ Complete |
| PWA support | ✅ Complete |
| Capacitor mobile wrapper | ✅ Complete |
| Analytics | ✅ Complete |
| Stripe payment integration | ❌ Not started |
| Additional activity types | ❌ Not started |
| Weekly planner UI | ❌ Not started |

## Next Roadmap Priorities

1. Stripe payment integration (checkout, webhook, billing portal, subscription sync).
2. Additional activity gameplay types (listen_choose, trace, speak_tap_aac, parent_guided, routine_checkoff).
3. Weekly planner UI for parents.
4. Accessibility audit and improvements.
5. Design polish pass.
6. Deployment readiness and QA.

## Documentation Responsibilities

When implementing or modifying features, update:

| File | What to update |
| --- | --- |
| `REPO_SNAPSHOT.md` | Directory structure, completed steps, architecture notes, new components, new migrations |
| `PROJECT_CONTEXT.md` | Product capabilities, architecture overview |
| `CONTRIBUTING.md` | Setup instructions, development commands, testing instructions |
| `AI_CONTEXT.md` | Development stage, systems status, architecture notes |

Never overwrite these files blindly. Always read current content and merge updates.
