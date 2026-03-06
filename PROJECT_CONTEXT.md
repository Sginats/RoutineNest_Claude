# RoutineNest — Project Context

RoutineNest is a mobile-first visual study and routine-support platform for children with autism and similar support needs.

Platforms:
- Web (Next.js)
- PWA (installable offline-first)
- Android/iOS (Capacitor wrapper)

Core features:
- **Kid Home** — 5-tile grid: Study, Talk, Schedule, Rewards, Break
- **Visual Schedule** — daily routines with tap-to-complete
- **AAC Talk Board** — tap to speak via TTS (always free)
- **Study Curriculum** — structured learning hierarchy (Age → Class → Subject → Module → Lesson → Activity)
- **Interactive Activities** — tap-correct, visual matching, sequencing, and more
- **Rewards & Badges** — stars, streak counter, earnable badges
- **Break Page** — calm prompts, breathing timer
- **Onboarding Wizard** — 5-step first-time parent flow
- **Parent Dashboard** — create/edit schedules, cards, study plans
- **Progress Tracking** — parent dashboard with subject progress, streaks, recent activity
- **Subscription** — free (routines + AAC) and premium (full curriculum + analytics)
- **Settings** — calm mode, grid size, sound toggle, analytics opt-out
- **Offline-first** — schedule + AAC + study all work without internet

Stack:
- Next.js (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (Auth, Postgres, Storage)
- TanStack Query
- Offline: PWA + query cache persistence + mutation queue
- TTS: Capacitor plugin + Web Speech API fallback
- Analytics: PostHog (opt-out, no session replay by default)

MVP Non-goals:
- multi-parent invites
- therapist portal
- complex conflict resolution beyond last-write-wins
- payment processing (Stripe integration planned)
