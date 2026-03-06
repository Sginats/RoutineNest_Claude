# RoutineNest — Agent Tasks

This file helps AI agents and developers plan development work without breaking the project architecture.

Read [AI_CONTEXT.md](./AI_CONTEXT.md) and [ARCHITECTURE_MAP.md](./ARCHITECTURE_MAP.md) before starting any task.

---

## Current Priorities

1. **Stripe payment integration** — allow parents to upgrade to premium tier.
2. **Weekly planner UI** — parent view for scheduling study sessions by day.
3. **Additional activity gameplay types** — interactive components for `listen_choose` and `trace`.
4. **Progress analytics improvements** — richer charts on the parent progress dashboard.
5. **Accessibility audit** — verify WCAG AA compliance across all pages.
6. **Design polish** — consistency pass on spacing, typography, and colour use.

---

## Implementation Roadmap

| Priority | Task | Status |
| --- | --- | --- |
| 1 | Stripe payment integration | ❌ Not started |
| 2 | Weekly planner UI | ❌ Not started |
| 3 | `listen_choose` activity gameplay | ❌ Not started |
| 4 | `trace` activity gameplay | ❌ Not started |
| 5 | Progress analytics improvements | ❌ Not started |
| 6 | Accessibility audit | ❌ Not started |
| 7 | Design polish | ❌ Not started |
| 8 | Multi-parent invites | ❌ Not started |
| 9 | Therapist portal | ❌ Not started |
| 10 | A/B testing with PostHog feature flags | ❌ Not started |

---

## Task Templates

Use this template when planning a new task.

---

### TASK: Stripe Payment Integration

**Goal**  
Allow parents to upgrade from `free` to `premium` tier by paying via Stripe.

**Files involved**
- `src/app/parent/subscription/page.tsx` — add Checkout button
- `src/lib/subscriptionHooks.ts` — add mutation to sync tier after payment
- `src/lib/db.ts` — `updateSubscriptionTier()` already exists
- New: Stripe webhook handler (server-side or edge function — note: static export requires external function or Supabase Edge Function)
- `supabase/migrations/` — add webhook event log table if needed

**Implementation steps**
1. Create a Stripe account and product/price.
2. Add `STRIPE_PUBLISHABLE_KEY` (client-safe) to env.
3. Add Stripe Checkout redirect in `subscription/page.tsx`.
4. Create a Supabase Edge Function to handle `checkout.session.completed` webhook.
5. Webhook updates `profiles.subscription_tier` to `'premium'`.
6. Add billing portal link for managing / cancelling subscription.
7. Invalidate `useSubscription` query after successful payment.

**Testing instructions**
- Use Stripe test mode and test card `4242 4242 4242 4242`.
- Confirm `profiles.subscription_tier` updates to `'premium'` after checkout.
- Confirm premium study pages unlock after payment.
- Confirm AAC Talk Board still works for free users.

---

### TASK: Weekly Planner UI

**Goal**  
Parent view to assign study subjects/modules to specific days of the week.

**Files involved**
- `src/app/parent/study/page.tsx` — add Weekly Plan section
- `src/lib/studyDb.ts` — `getWeeklyPlanEntries()`, `upsertWeeklyPlanEntry()`, `deleteWeeklyPlanEntry()` helpers
- `supabase/migrations/20260305000005_weekly_plan_entries.sql` — table already exists

**Implementation steps**
1. Fetch `weekly_plan_entries` for the current profile.
2. Render a 7-column grid (Mon–Sun) with subject/module tiles per day.
3. Allow drag-and-drop or tap-to-assign subjects to days.
4. Persist entries via `upsertWeeklyPlanEntry`.
5. Show the plan on the Kid Home study entry point.

**Testing instructions**
- Assign subjects to multiple days.
- Reload and confirm assignments persist.
- Confirm no entries appear for days not assigned.

---

### TASK: `listen_choose` Activity Gameplay

**Goal**  
Interactive activity component that plays an audio clip and asks the child to tap the matching answer.

**Files involved**
- New: `src/components/activities/ListenChooseActivity.tsx`
- `src/components/activities/index.ts` — export new component
- `src/lib/activityGameplayData.ts` — add gameplay data entries
- `src/app/kid/study/lesson/[lessonId]/LessonActivitiesClient.tsx` — wire up new type

**Implementation steps**
1. Create `ListenChooseActivity` component with audio playback + answer tiles.
2. Use Web Audio API or `<audio>` element; fall back gracefully if audio unavailable.
3. Add gameplay data entries for existing `listen_choose` seed activities.
4. Export from `activities/index.ts`.
5. Add `case "listen_choose"` to `ActivityGameplay` switch in `LessonActivitiesClient.tsx`.

**Testing instructions**
- Open a `listen_choose` lesson activity.
- Confirm audio plays on tap of play button.
- Tap correct answer — confirm completion recorded.
- Tap wrong answer — confirm gentle feedback shown.

---

### TASK: `trace` Activity Gameplay

**Goal**  
Interactive letter/number tracing component using touch/mouse input.

**Files involved**
- New: `src/components/activities/TraceActivity.tsx`
- `src/components/activities/index.ts` — export
- `src/lib/activityGameplayData.ts` — add trace data entries
- `src/app/kid/study/lesson/[lessonId]/LessonActivitiesClient.tsx` — wire up

**Implementation steps**
1. Create `TraceActivity` component with SVG or Canvas tracing path.
2. Detect touch/mouse movement along the path within a tolerance.
3. Provide visual feedback (colour fill) as the child traces.
4. Add gameplay data for existing `trace` seed activities (e.g., `act-abc-trace`).
5. Export and wire up in `LessonActivitiesClient.tsx`.

**Testing instructions**
- Open a `trace` lesson activity.
- Trace the letter with mouse or touch.
- Confirm completion triggers when path is sufficiently followed.
- Test on mobile device for touch accuracy.

---

### TASK: New Activity Type (Generic Template)

**Goal**  
[Describe the activity type and user interaction.]

**Files involved**
- New: `src/components/activities/<TypeName>Activity.tsx`
- `src/components/activities/index.ts`
- `src/lib/activityGameplayData.ts`
- `src/app/kid/study/lesson/[lessonId]/LessonActivitiesClient.tsx`

**Implementation steps**
1. Create the activity component.
2. Export from `activities/index.ts`.
3. Add gameplay data entries.
4. Wire up with `case "<type>"` in `ActivityGameplay` switch.
5. Test completion flow and star reward.

**Testing instructions**
- Verify the activity renders correctly.
- Verify completion records a star in `child_progress`.
- Verify calm mode disables animations.
- Verify touch targets are ≥ 48 × 48 px.

---

## Architecture Rules for All Tasks

- Do not add subscription checks to AAC or kid-facing pages.
- Do not add server-side rendering — static export only.
- Add RLS policies to any new Supabase table before use.
- Test offline behaviour after any data-layer change.
- All new files must be TypeScript.
- Follow kid UI patterns: large touch targets, calm colours, icon + label pairs.
