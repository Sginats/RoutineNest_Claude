// RoutineNest — Study Plan system types
// Types for the structured learning / study plan feature

// ---------------------------------------------------------------------------
// Enums & union types
// ---------------------------------------------------------------------------

export type StudyIntensity = "light" | "medium" | "focused";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type ActivityType =
  | "visual_matching"
  | "tap_correct"
  | "sequencing"
  | "listen_choose"
  | "speak_tap_aac"
  | "trace"
  | "routine_checkoff"
  | "parent_guided"
  | "printable";

// ---------------------------------------------------------------------------
// Curriculum structure
// ---------------------------------------------------------------------------

export interface YearCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  age_min: number;
  age_max: number;
  created_at: string;
  updated_at: string;
}

export interface ClassLevel {
  id: string;
  year_category_id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface SubjectArea {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudyModule {
  id: string;
  subject_area_id: string;
  class_level_id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  difficulty: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  difficulty: number;
  duration_minutes: number;
  reward_points: number;
  is_premium: boolean;
  calm_mode_safe: boolean;
  requires_parent_help: boolean;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  difficulty: number;
  duration_minutes: number;
  reward_points: number;
  activity_type: ActivityType;
  instructions: string;
  audio_cue: string | null;
  aac_support: boolean | null;
  is_premium: boolean;
  calm_mode_safe: boolean;
  requires_parent_help: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Child-specific planning & progress
// ---------------------------------------------------------------------------

export interface WeeklyPlanEntry {
  id: string;
  learning_plan_id: string;
  day: DayOfWeek;
  subject_area_id: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ChildLearningPlan {
  id: string;
  profile_id: string;
  class_level_id: string;
  intensity: StudyIntensity;
  session_length_minutes: number;
  subject_area_ids: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChildProgress {
  id: string;
  profile_id: string;
  activity_id: string;
  lesson_id: string;
  module_id: string;
  completed: boolean;
  score: number | null;
  attempts: number;
  last_attempted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChildPreferences {
  id: string;
  profile_id: string;
  preferred_difficulty: number;
  favorite_subject_ids: string[];
  repeat_completed_lessons: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Insert helper types (omit server-generated fields)
// ---------------------------------------------------------------------------

export type YearCategoryInsert = Omit<
  YearCategory,
  "id" | "created_at" | "updated_at"
> & { id?: string };

export type ClassLevelInsert = Omit<
  ClassLevel,
  "id" | "created_at" | "updated_at"
> & { id?: string };

export type SubjectAreaInsert = Omit<
  SubjectArea,
  "id" | "created_at" | "updated_at"
> & { id?: string };

export type StudyModuleInsert = Omit<
  StudyModule,
  "id" | "created_at" | "updated_at"
> & { id?: string };

export type LessonInsert = Omit<
  Lesson,
  "id" | "created_at" | "updated_at"
> & { id?: string };

export type ActivityInsert = Omit<
  Activity,
  "id" | "created_at" | "updated_at"
> & { id?: string };

export type WeeklyPlanEntryInsert = Omit<
  WeeklyPlanEntry,
  "id" | "created_at" | "updated_at"
> & { id?: string };

export type ChildLearningPlanInsert = Omit<
  ChildLearningPlan,
  "id" | "created_at" | "updated_at"
> & { id?: string };

export type ChildProgressInsert = Omit<
  ChildProgress,
  "id" | "created_at" | "updated_at"
> & { id?: string };

export type ChildPreferencesInsert = Omit<
  ChildPreferences,
  "id" | "created_at" | "updated_at"
> & { id?: string };

// ---------------------------------------------------------------------------
// Patch helper types (partial updates for mutable fields)
// ---------------------------------------------------------------------------

export type YearCategoryPatch = Partial<
  Pick<YearCategory, "title" | "description" | "icon" | "order" | "age_min" | "age_max">
>;

export type ClassLevelPatch = Partial<
  Pick<ClassLevel, "title" | "description" | "icon" | "order" | "year_category_id">
>;

export type SubjectAreaPatch = Partial<
  Pick<SubjectArea, "title" | "description" | "icon" | "order" | "is_premium">
>;

export type StudyModulePatch = Partial<
  Pick<
    StudyModule,
    "title" | "description" | "icon" | "order" | "difficulty" | "is_premium" | "subject_area_id" | "class_level_id"
  >
>;

export type LessonPatch = Partial<
  Pick<
    Lesson,
    | "title"
    | "description"
    | "icon"
    | "order"
    | "difficulty"
    | "duration_minutes"
    | "reward_points"
    | "is_premium"
    | "calm_mode_safe"
    | "requires_parent_help"
  >
>;

export type ActivityPatch = Partial<
  Pick<
    Activity,
    | "title"
    | "description"
    | "icon"
    | "order"
    | "difficulty"
    | "duration_minutes"
    | "reward_points"
    | "activity_type"
    | "instructions"
    | "audio_cue"
    | "aac_support"
    | "is_premium"
    | "calm_mode_safe"
    | "requires_parent_help"
  >
>;

export type ChildLearningPlanPatch = Partial<
  Pick<
    ChildLearningPlan,
    | "class_level_id"
    | "intensity"
    | "session_length_minutes"
    | "subject_area_ids"
    | "is_active"
  >
>;

export type ChildProgressPatch = Partial<
  Pick<
    ChildProgress,
    "completed" | "score" | "attempts" | "last_attempted_at" | "completed_at"
  >
>;

export type ChildPreferencesPatch = Partial<
  Pick<
    ChildPreferences,
    "preferred_difficulty" | "favorite_subject_ids" | "repeat_completed_lessons"
  >
>;

// ---------------------------------------------------------------------------
// Predefined catalogue constants
// ---------------------------------------------------------------------------

export const YEAR_CATEGORIES = [
  { title: "Early Learners", age_min: 3, age_max: 5 },
  { title: "Foundation Stage", age_min: 5, age_max: 7 },
  { title: "Primary Stage", age_min: 7, age_max: 9 },
  { title: "Intermediate Stage", age_min: 9, age_max: 11 },
  { title: "Advanced Primary", age_min: 11, age_max: 13 },
] as const;

export const CLASS_LEVELS = [
  "Pre-K",
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
] as const;

export const SUBJECT_AREAS = [
  "Communication",
  "Reading/Language",
  "Math",
  "Daily Living Skills",
  "Social Skills",
  "Fine Motor/Cognitive",
  "Creative/Calm Activities",
] as const;

export type YearCategoryTitle = (typeof YEAR_CATEGORIES)[number]["title"];
export type ClassLevelTitle = (typeof CLASS_LEVELS)[number];
export type SubjectAreaTitle = (typeof SUBJECT_AREAS)[number];
