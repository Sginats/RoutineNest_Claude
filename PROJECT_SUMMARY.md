# RoutineNest — Project Summary

> Fast context overview. A new developer or AI should understand the project in under five minutes.

## Project Overview

RoutineNest is a mobile-first visual study and routine-support platform for children with autism and similar support needs. Parents configure learning plans, schedules, and communication cards. Children interact with a simple, predictable, icon-driven interface.

Platforms:

- Web (Next.js, static export)
- PWA (installable, offline-first)
- Android / iOS (Capacitor wrapper)

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth, Postgres, Storage) |
| Data fetching | TanStack Query |
| Offline | PWA + IndexedDB query persistence + mutation sync queue |
| TTS | Capacitor plugin + Web Speech API fallback |
| Mobile | Capacitor (Android / iOS) |
| Analytics | PostHog (privacy-safe, opt-out, no session replay) |
| Icons | ARASAAC pictograms (CC BY-NC-SA 4.0, non-commercial) |
| Package manager | npm |

## Core Product Systems

### Authentication

Parent login with email/password via Supabase Auth. Persistent session. Login page supports both sign-in and account creation. First-time users with no profiles are redirected to onboarding.

### Onboarding

Five-step wizard: name → class level → subjects → session length → intensity. Creates child profile, learning plan, and preferences.

### Child Profiles

Stored in `profiles` table. Linked to `auth.users.id`. Include name, avatar, subscription tier, learning preferences.

### Kid Home

Five-tile grid: Study, Talk, Schedule, Rewards, Break. Large touch targets, icon + label pairs, calm colour palette.

### AAC Talk Board

Category-based communication cards with TTS playback. Tap a card to speak its label. Always free — no subscription check.

### Visual Schedule

Daily routine grid with tap-to-complete tracking. Supports offline completion with sync queue.

### Study Curriculum

Hierarchy: Age Group → Class Level → Subject → Module → Lesson → Activity. Seed data in `src/lib/studySeedData.ts`. Premium subjects gated for free-tier users.

### Activity Gameplay

Implemented interactive types: `tap_correct`, `visual_matching`, `sequencing`. Additional types (`listen_choose`, `trace`, `speak_tap_aac`, `parent_guided`, `routine_checkoff`) fall back to instructions + Done button. Gameplay data keyed by activity ID in `src/lib/activityGameplayData.ts`.

### Rewards

Stars earned by completing activities. Streak counter computed from consecutive days. Seven earnable badges (star thresholds: 1/5/10/25/50 + streak milestones: 3/7 days).

### Progress Tracking

Parent dashboard shows subject progress, streaks, recent activity. Data stored in `child_progress` table.

### Parent Dashboard

Quick-nav cards for Study Planner, Progress Dashboard, Rewards, Settings. Study planner includes learning track, subject focus, weekly plan, and study settings.

### Subscription System

Two tiers: `free` and `premium`, stored on `profiles.subscription_tier`.

- Free: routines, AAC talk board, visual schedule, rewards, starter curriculum.
- Premium: full study curriculum, advanced learning plans, progress analytics.
- AAC is always free — enforced in code.

Parent subscription page with tier selector, feature comparison, and AAC-is-free reassurance.

### Payment Integration

Stripe integration planned but not yet implemented. Will support checkout, webhook, billing portal, and subscription sync.

### Offline Support

Offline-first PWA with IndexedDB query cache persistence and mutation sync queue. Schedule, AAC, and study all work without internet. Queued mutations replay on reconnect.

## Architecture Highlights

### Offline-First Architecture

TanStack Query cache persisted to IndexedDB via `idb-keyval`. Mutations queued in `routinenest_sync_queue` and flushed when connectivity returns.

### Supabase RLS Security

Row Level Security enabled on all tables. Every query scoped to `auth.uid()`. No data leaks between users.

### Client-First Design

Static export (`output: "export"` in `next.config.ts`). No server-side rendering. Nullable Supabase client allows builds without env vars for CI.

### Capacitor Mobile Wrapper

Web app wrapped with Capacitor for Android and iOS. Native TTS via `@capacitor-community/text-to-speech`. Build with `npm run cap:build`, open with `npm run cap:open:android` or `npm run cap:open:ios`.

### Activity Gameplay System

Components in `src/components/activities/`. Gameplay data in `src/lib/activityGameplayData.ts`. `ActivityGameplay` component in `LessonActivitiesClient.tsx` routes to the correct activity component by type.

### Curriculum Seed Data Structure

Static seed data in `src/lib/studySeedData.ts`: `SEED_YEAR_CATEGORIES`, `SEED_CLASS_LEVELS`, `SEED_SUBJECT_AREAS`, `SEED_MODULES`, `SEED_LESSONS`, `SEED_ACTIVITIES`. DB helpers in `src/lib/studyDb.ts`.

### Theme System

Two themes: Playful (default, warm teal/coral/sunny) and Calm (`.calm` class on `<html>`, soft pastel blue/green). Calm mode disables animations and transitions. Controlled via Settings.

## Important Product Rules

- AAC communication must always remain free.
- Child interfaces must never show paywalls.
- Subscription prompts only appear in parent areas.
- Offline functionality must always work.
- No secrets in client code.
- Never send child identifiers to analytics.
- All Supabase queries must respect Row Level Security.
- ARASAAC pictograms are non-commercial only — commercial use requires own icons.

## Future Extension Areas

- Stripe payment integration (checkout, webhook, billing portal, subscription sync).
- Additional activity gameplay types (listen_choose, trace, speak_tap_aac, parent_guided, routine_checkoff).
- Weekly planner UI for parents.
- Accessibility audit and improvements.
- Design polish pass.
- A/B testing with PostHog feature flags.
- Multi-parent invites.
- Therapist portal.

## Legal

- [Privacy Policy](./PRIVACY.md)
- [Terms of Use](./TERMS.md)
