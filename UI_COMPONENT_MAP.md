# UI Component Map

> Maps every reusable UI component in the RoutineNest design system to the
> pages that use it. Updated to reflect the Stitch design-system rebuild.

---

## Kid-Facing Components (`src/components/kid/`)

| Component | Description | Used By |
|---|---|---|
| `BigTileButton` | Large accessible tile (48 px+ touch targets) with image/emoji fallback. Supports `bigButtonMode` and `pressed` state. | `/kid/talk` (AAC grid) |
| `AACCard` | AAC communication card with Material Symbol icon and coloured border. | `/kid/talk` (talk board grid) |
| `KidShell` | Page layout wrapper — title bar with emoji, optional trailing element, padding. | All `/kid/*` pages |
| `EmptyState` | Friendly empty panel with emoji, heading, description. | All `/kid/*` pages (loading/empty states) |
| `ScheduleItem` | Schedule task card with icon, title, time, completion toggle. | `/kid/schedule` |
| `RoutineSection` | Section heading wrapper with optional action button. | Various kid pages |
| `MascotCard` | Cute mascot display (bird emoji) with optional speech message. | `/kid/break`, onboarding |
| `BreathingCircle` | Breathing exercise with concentric pulsing circles. Respects `calm` prop. | `/kid/break` |
| `SuccessCard` | Activity completion screen with animated stars and navigation buttons. **Now respects `calm` prop**. | Lesson activities |
| `ProgressRing` | **NEW** — Circular SVG progress ring. Configurable size, stroke, color. | `SubjectCard`, progress views |
| `RewardBadge` | **NEW** — Circular reward badge with earned/locked states and color variants. | `/kid/rewards` |
| `ActivityGameContainer` | **NEW** — Wrapper for interactive activity gameplay screens with header + progress bar. | Activity components |

## Study Components (`src/components/study/`)

| Component | Description | Used By |
|---|---|---|
| `SubjectCard` | Subject card with icon, title, and circular progress ring (**now uses `ProgressRing`**). | Study planner, subject listing |
| `StudyTile` | Large study subject tile with emoji, progress bar, and lock state. | `/kid/study` (study home grid) |
| `LessonCard` | Horizontal lesson card with icon, duration, reward stars, completion/locked state. | Module lessons view |
| `ProgressBar` | Kid-friendly progress bar. **Now supports `color` variant** (`primary`, `success`, `star`). | All pages with progress indicators |
| `RewardStars` | Row of filled/empty star icons. | Rewards, lesson completion |
| `SubjectBadge` | Pill badge showing subject name and icon. | Lesson activities |
| `BreakCard` | "Time for a break" prompt card. | Study home (inserted every 3 subjects) |

## Parent Components (`src/components/parent/`)

| Component | Description | Used By |
|---|---|---|
| `ParentStatCard` | **NEW** — Stat card with icon, metric, trend indicator, and subtitle. | `/parent/study/progress` |

## Shared Components (`src/components/`)

| Component | Description | Used By |
|---|---|---|
| `NavBar` | Sticky navigation header with 6 links + calm-mode sync. | Root layout |
| `ParentGate` | 3-second hold-to-unlock gate with 10-minute session timeout. | All `/parent/*` pages |
| `UpgradeBanner` | Premium upgrade banner. AAC always-free reassurance note. | Study pages (free tier) |
| `OfflineBanner` | Offline status indicator. | Root layout |
| `ErrorBoundary` | Error fallback UI. | Root layout |
| `IconPicker` | Icon selection grid for card editing. | Parent dashboard (cards editor) |

## shadcn/ui Base Components (`src/components/ui/`)

| Component | Notes |
|---|---|
| `Button` | Standard button with variants (default, outline, secondary, ghost, destructive) |
| `Card` / `CardHeader` / `CardContent` / `CardTitle` / `CardDescription` | Card container primitives |
| `Input` | Text input |
| `Label` | Form label |
| `Switch` | Toggle switch |

---

## Design Tokens

| Token | Value | Usage |
|---|---|---|
| `--primary` | `174 56% 34%` (teal) | Primary actions, active states |
| `--kid-teal` | `174 36% 51%` | Study tile background |
| `--kid-coral` | `14 100% 70%` | Talk tile background |
| `--kid-yellow` | `46 100% 66%` | Schedule tile background |
| `--kid-blue` | `207 90% 68%` | Rewards tile background |
| `--kid-mint` | `123 29% 65%` | Break tile background |
| `--star-yellow` | `51 100% 50%` | Star/reward accents |
| `--success` | `145 60% 42%` | Completion states |

## Accessibility Guidelines

- **Touch targets**: Minimum 48 px (per WCAG 2.5.8)
- **Text**: Minimal for kid UI; all interactive elements have `aria-label`
- **Icons**: High-contrast Material Symbols with `aria-hidden="true"`
- **Calm mode**: `.calm` class disables all CSS animations and transitions
- **Screen readers**: All progress bars have `role="progressbar"` with ARIA values
- **Big-button mode**: Enlarges all interactive elements when `big_button_mode` setting is enabled

## Page → Component Mapping

| Page | Key Components Used |
|---|---|
| `/` (Kid Home) | Tiles, bottom nav |
| `/kid/talk` | `KidShell`, `BigTileButton`, sentence bar |
| `/kid/schedule` | `KidShell`, `ProgressBar`, schedule tab selector, task items |
| `/kid/study` | `KidShell`, `StudyTile`, `BreakCard` |
| `/kid/study/lesson/[id]` | `KidShell`, `ProgressBar`, `RewardStars`, `SubjectBadge`, activity components, `SuccessCard` |
| `/kid/rewards` | `KidShell`, `RewardBadge`, `ProgressBar`, streak grid |
| `/kid/break` | `KidShell`, `BreathingCircle`, timer |
| `/parent` | `ParentGate`, `Card`, cards editor, schedule builder |
| `/parent/study` | `ParentGate`, `Card`, study planner sections |
| `/parent/study/progress` | `ParentGate`, `ParentStatCard`, `ProgressBar`, `RewardStars` |
| `/parent/subscription` | `ParentGate`, feature comparison grid |
| `/settings` | `Card`, `Switch`, settings toggles |
| `/onboarding` | Step wizard, `Card`, selection grids |
