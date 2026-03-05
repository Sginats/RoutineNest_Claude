# RoutineNest — Repo Snapshot

Last updated: 2026-03-05

## Current State

This repo has completed STEP 15 — Parent MVP editors (Cards manager + Schedule builder).

## Directory Structure

```
/
├── PROJECT_CONTEXT.md
├── LLM_RULES.md
├── REPO_SNAPSHOT.md
├── CONTRIBUTING.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
└── src/
    ├── app/
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── providers.tsx
    │   ├── page.tsx
    │   ├── login/page.tsx
    │   ├── parent/page.tsx
    │   ├── settings/page.tsx
    │   └── kid/
    │       ├── schedule/page.tsx   ← STEP 12
    │       ├── talk/page.tsx
    │       └── rewards/page.tsx
    ├── components/
    │   ├── ParentGate.tsx
    │   └── ui/ (button, card, input, label, switch)
    ├── hooks/
    │   └── useAuth.ts
    └── lib/
        ├── db.ts
        ├── types.ts
        ├── settingsHooks.ts
        ├── profileStore.ts
        ├── supabaseClient.ts
        └── utils.ts
```

## Stack (planned)

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

## Next Steps

- [ ] STEP 16 — (TBD)
