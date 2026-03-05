# RoutineNest — Repo Snapshot

Last updated: 2026-03-05

## Current State

This repo is in the initial setup phase (STEP 0).

## Directory Structure

```
/
├── PROJECT_CONTEXT.md   # App description, stack, features
├── LLM_RULES.md         # Hard rules for Copilot / LLM agents
├── REPO_SNAPSHOT.md      # This file — current repo state
├── CONTRIBUTING.md       # Contribution guidelines
└── README.md             # Repo readme
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

## Next Steps

- [ ] STEP 1 — Scaffold Next.js app with TypeScript and Tailwind
