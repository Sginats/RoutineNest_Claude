# RoutineNest — Project Context

RoutineNest is a mobile-first routines + AAC communication app for children with autism and similar support needs.

Platforms:
- Web (Next.js)
- Android/iOS (Capacitor wrapper)

Core features:
- Visual Schedule
- AAC Talk Board (tap to speak via TTS)
- Rewards (stars)
- Parent Dashboard (create/edit schedules and cards)
- Settings:
  - Calm Mode (reduced animations, softer UI, no surprise sounds)
  - Big-button mode (grid size 2/3/4)
  - Parent lock (hold-to-enter parent/settings)
- Offline-first: schedule + AAC must work without internet
- Custom cards: photo + label + TTS text

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
