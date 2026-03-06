# Copilot Rules (MUST FOLLOW)

All AI coding agents must read the following files before implementing changes:

1. AI_CONTEXT.md
2. PROJECT_CONTEXT.md
3. REPO_SNAPSHOT.md
4. LLM_RULES.md
5. CONTRIBUTING.md

You are working inside this GitHub repo.

Hard rules:
1) Do ONE step per response (commit-sized).
2) Only change files you list under "Files to change/create".
3) For every changed file, output COMPLETE final contents (no partial diffs).
4) Use Node + npm (no pnpm/yarn).
5) Keep Next.js App Router conventions.
6) Prioritize accessibility: large touch targets, predictable UI.
7) End with:
   - Commands
   - How to test
8) STOP and wait for: "next step"

Required output format:

STEP <number>: <title>
