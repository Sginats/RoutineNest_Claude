# RoutineNest — Repo Snapshot

Last updated: 2026-03-05

## Current State

This repo has completed STEP 1 — Next.js app scaffolded with TypeScript, ESLint, and Tailwind CSS.

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
    └── app/
        ├── favicon.ico
        ├── globals.css
        ├── layout.tsx
        └── page.tsx
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

## Next Steps

- [ ] STEP 2 — (TBD)
