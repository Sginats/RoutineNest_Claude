# RoutineNest — Content System

This document explains how the learning curriculum is structured and how to safely extend it.

---

## Curriculum Hierarchy

Content is organised in a strict six-level hierarchy:

```
Age Group (YearCategory)
  └── Class Level (ClassLevel)
        └── Subject (SubjectArea)
              └── Module (StudyModule)
                    └── Lesson (Lesson)
                          └── Activity (Activity)
```

### Level descriptions

| Level | Type | Description |
| --- | --- | --- |
| Age Group | `YearCategory` | Broad age band (e.g., Early Learners 3–5, Foundation Stage 5–7) |
| Class Level | `ClassLevel` | Specific year/grade within an age group |
| Subject | `SubjectArea` | Learning domain (e.g., Communication, Math, Daily Living Skills) |
| Module | `StudyModule` | Topic cluster within a subject (e.g., Basic Needs, Greetings) |
| Lesson | `Lesson` | A focused learning session within a module |
| Activity | `Activity` | A single interactive task within a lesson |

---

## Seed Data Structure

All curriculum content is defined in static TypeScript arrays in `src/lib/studySeedData.ts`. No database seed scripts are required — the app loads this data at runtime and upserts it into Supabase on first run.

### Arrays

| Export | Type | Description |
| --- | --- | --- |
| `SEED_YEAR_CATEGORIES` | `SeedYearCategory[]` | 5 age groups (Early Learners through Advanced) |
| `SEED_CLASS_LEVELS` | `SeedClassLevel[]` | Class levels linked to year categories |
| `SEED_SUBJECT_AREAS` | `SeedSubjectArea[]` | 7 subjects (5 free, 2 premium) |
| `SEED_MODULES` | `SeedModule[]` | Topic modules per subject |
| `SEED_LESSONS` | `SeedLesson[]` | Individual lessons per module |
| `SEED_ACTIVITIES` | `SeedActivity[]` | Interactive activities per lesson |

### Subject areas

| Subject | Premium |
| --- | --- |
| Communication | Free |
| Reading / Language | Free |
| Math | Free |
| Daily Living Skills | Free |
| Social Skills | Free |
| Fine Motor / Cognitive | Premium |
| Creative / Calm Activities | Premium |

### Helper function

Activities are created via a `act()` helper function defined in `studySeedData.ts`:

```ts
act(id, lessonId, title, description, icon, order, stars, ageMin, ageMax, type, instructions, isPremium, metadata?)
```

---

## Activity Types

All possible activity types are defined in `src/lib/studyTypes.ts`:

```ts
type ActivityType =
  | "visual_matching"   // Drag/match pairs
  | "tap_correct"       // Tap the correct answer from options
  | "sequencing"        // Put steps in correct order
  | "listen_choose"     // Listen to audio, tap matching answer
  | "speak_tap_aac"     // Use AAC board to produce a phrase
  | "trace"             // Finger/mouse tracing of letters or shapes
  | "routine_checkoff"  // Guided routine checklist
  | "parent_guided"     // Requires parent participation
  | "printable";        // Printable worksheet (no interactive component)
```

---

## Gameplay Components

The `ActivityGameplay` component in `LessonActivitiesClient.tsx` selects the correct interactive component by `activity_type`:

| Type | Component | Status |
| --- | --- | --- |
| `tap_correct` | `TapCorrectActivity` | ✅ Implemented |
| `visual_matching` | `VisualMatchingActivity` | ✅ Implemented |
| `sequencing` | `SequencingActivity` | ✅ Implemented |
| `listen_choose` | — | ❌ Falls back to instructions + Done |
| `speak_tap_aac` | — | ❌ Falls back to instructions + Done |
| `trace` | — | ❌ Falls back to instructions + Done |
| `routine_checkoff` | — | ❌ Falls back to instructions + Done |
| `parent_guided` | — | ❌ Falls back to instructions + Done |
| `printable` | — | ❌ Falls back to instructions + Done |

Gameplay question/answer data is stored in `src/lib/activityGameplayData.ts`, keyed by `activity.id`.

---

## How Gameplay Data Works

```ts
// activityGameplayData.ts
export const ACTIVITY_GAMEPLAY_DATA: Record<string, GameplayData> = {
  "act-abc-match": {
    type: "visual_matching",
    pairs: [
      { left: "A", right: "a" },
      { left: "B", right: "b" },
    ],
  },
  // ...
};
```

If no gameplay data exists for an activity ID, the fallback (instructions + Done button) is shown.

---

## Future Content Expansion

### Adding a new lesson

1. Add a `SeedLesson` entry to `SEED_LESSONS` in `studySeedData.ts`.
2. Set `module_id` to an existing module ID.
3. Add one or more `SeedActivity` entries to `SEED_ACTIVITIES` with `lesson_id` matching the new lesson.
4. Choose `activity_type` values from the supported list.
5. If the type has an interactive component, add gameplay data in `activityGameplayData.ts`.

### Adding a new module

1. Add a `SeedModule` entry to `SEED_MODULES`.
2. Set `subject_id` to an existing subject ID.
3. Add lessons and activities as above.

### Adding a new subject

1. Add a `SeedSubjectArea` entry to `SEED_SUBJECT_AREAS`.
2. Set `is_premium` appropriately.
3. Set `year_category_id` and `class_level_id` to the target age group.
4. Add modules, lessons, and activities.

### Adding a new activity gameplay type

1. Create a component in `src/components/activities/<TypeName>Activity.tsx`.
2. Export from `src/components/activities/index.ts`.
3. Add gameplay data entries in `activityGameplayData.ts`.
4. Add a `case "<type>"` in the `ActivityGameplay` switch in `LessonActivitiesClient.tsx`.
5. See `AGENT_TASKS.md` for detailed task templates.

### Rules when adding content

- All content must be appropriate for children with autism.
- Use clear, simple language in instructions.
- Prefer icon + label pairs over text alone.
- AAC-supporting activities should set `aac_support: true` in metadata.
- Activities requiring a parent should set `requires_parent_help: true` in metadata.
- Premium content should only appear in `is_premium: true` subjects — never gate free subjects.
- Do not remove existing seed data IDs — other records may reference them.
