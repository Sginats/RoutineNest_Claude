# AI Context — RoutineNest

All AI coding agents working on this repository must read the following files before implementing changes:

1. AI_CONTEXT.md
2. PROJECT_SUMMARY.md
3. REPO_SNAPSHOT.md
4. CONTRIBUTING.md

## Project Purpose

RoutineNest is a mobile-first visual study and routine-support platform for children with autism and similar support needs. Parents configure learning plans, schedules, and communication cards. Children interact with a simple, predictable, icon-driven interface. Targets Web (Next.js), PWA, Android, and iOS (Capacitor).

## Architecture Principles

- Next.js App Router conventions for all pages and layouts.
- Supabase Row Level Security on every table.
- Nullable Supabase client — builds succeed without env vars for CI.
- Offline-first: TanStack Query cache persisted to IndexedDB + mutation sync queue.
- Static export (`output: "export"`) — no server-side rendering.
- Subscription tier stored on `profiles.subscription_tier` (`free` | `premium`).
- AAC communication is always free — no subscription check on Talk pages.
- Kid-facing components use `src/components/kid/` (KidShell, BigTileButton, EmptyState).
- Activity gameplay components live in `src/components/activities/`.
- Seed curriculum data in `src/lib/studySeedData.ts`.

## Autism-Friendly UX Rules

Kid-facing interfaces must follow:

- Large touch targets (minimum 48 × 48 px).
- Minimal text — prefer icon + label pairs.
- Predictable navigation with consistent layout.
- Calm colour palette (warm teal/coral default, muted blue calm mode).
- Minimal animation; calm mode disables all transitions.
- No flashing elements.
- Clear next actions in every flow.
- All images and icons must have meaningful alt text or aria labels.
- Repetition-friendly learning activities.

## Non-Negotiable Product Rules

- AAC communication must always remain free.
- Never show paywalls in child-facing flows.
- Subscription prompts appear only in parent interfaces.
- All Supabase queries must respect Row Level Security.
- Offline functionality must always work.
- Never expose secrets in client code.
- Never send child identifiers to analytics.

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
| Icons | ARASAAC pictograms (CC BY-NC-SA 4.0) |
| Package manager | npm |

## Engineering Constraints

- Use Node + npm only (no pnpm/yarn).
- All new files must be TypeScript (`.ts` / `.tsx`).
- Follow App Router conventions for pages and layouts.
- Use Tailwind CSS utility classes for styling.
- Use shadcn/ui components where available.
- Keep components small and focused.
- One logical change per commit.
- `env.ts` exports env vars without throwing — safe for static export / prerendering.
- `supabaseClient.ts` returns `null` when env vars are missing — all consumers handle null.

## Current Development Stage

Completed through STEP 17. Major systems implemented:

- Auth + login, onboarding wizard, kid home hub (5-tile grid).
- Visual schedule, AAC Talk Board (always free), break page.
- Study curriculum with seed data, interactive activities (3 types).
- Rewards with streaks and 7 earnable badges.
- Parent dashboard with study planner and progress tracking.
- Subscription model (free/premium) with UpgradeBanner gating.
- Offline-first PWA, Capacitor mobile wrapper, PostHog analytics.
- Theme system (Playful default + Calm mode).

Not yet started: Stripe payment integration, additional activity types, weekly planner UI.

## Documentation Responsibilities

When implementing or modifying features, update:

| File | What to update |
| --- | --- |
| `REPO_SNAPSHOT.md` | Directory structure, completed steps, architecture notes, new components, new migrations |
| `PROJECT_SUMMARY.md` | Product capabilities, architecture overview, future extension areas |
| `CONTRIBUTING.md` | Setup instructions, development commands, testing instructions |
| `AI_CONTEXT.md` | Development stage, architecture notes, engineering constraints |

Never overwrite these files blindly. Always read current content and merge updates.
