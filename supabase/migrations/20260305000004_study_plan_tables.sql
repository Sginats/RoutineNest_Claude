-- RoutineNest — Study plan tables: curriculum hierarchy + child learning state
-- Creates nine new tables for the study plan system.
-- Curriculum tables (year_categories … activities) are read-only for users.
-- Child tables (child_learning_plans, child_progress, child_preferences) are
-- full-CRUD per user.  This migration is idempotent: safe to run multiple times.

-- =============================================================
-- 1. Curriculum tables
-- =============================================================

-- year_categories ---------------------------------------------------
create table if not exists public.year_categories (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  icon        text,
  "order"     integer not null default 0,
  age_min     integer,
  age_max     integer,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace trigger year_categories_updated_at
  before update on public.year_categories
  for each row execute function public.set_updated_at();

-- class_levels ------------------------------------------------------
create table if not exists public.class_levels (
  id               uuid primary key default gen_random_uuid(),
  year_category_id uuid not null references public.year_categories(id) on delete cascade,
  title            text not null,
  description      text,
  icon             text,
  "order"          integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create or replace trigger class_levels_updated_at
  before update on public.class_levels
  for each row execute function public.set_updated_at();

-- subject_areas -----------------------------------------------------
create table if not exists public.subject_areas (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  icon        text,
  "order"     integer not null default 0,
  is_premium  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace trigger subject_areas_updated_at
  before update on public.subject_areas
  for each row execute function public.set_updated_at();

-- study_modules -----------------------------------------------------
create table if not exists public.study_modules (
  id              uuid primary key default gen_random_uuid(),
  subject_area_id uuid not null references public.subject_areas(id) on delete cascade,
  class_level_id  uuid not null references public.class_levels(id) on delete cascade,
  title           text not null,
  description     text,
  icon            text,
  "order"         integer not null default 0,
  difficulty      integer,
  is_premium      boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create or replace trigger study_modules_updated_at
  before update on public.study_modules
  for each row execute function public.set_updated_at();

-- lessons -----------------------------------------------------------
create table if not exists public.lessons (
  id                   uuid primary key default gen_random_uuid(),
  module_id            uuid not null references public.study_modules(id) on delete cascade,
  title                text not null,
  description          text,
  icon                 text,
  "order"              integer not null default 0,
  difficulty           integer,
  duration_minutes     integer,
  reward_points        integer,
  is_premium           boolean not null default false,
  calm_mode_safe       boolean not null default true,
  requires_parent_help boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create or replace trigger lessons_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

-- activities --------------------------------------------------------
create table if not exists public.activities (
  id                   uuid primary key default gen_random_uuid(),
  lesson_id            uuid not null references public.lessons(id) on delete cascade,
  title                text not null,
  description          text,
  icon                 text,
  "order"              integer not null default 0,
  difficulty           integer,
  duration_minutes     integer,
  reward_points        integer,
  activity_type        text,
  instructions         text,
  audio_cue            text,
  aac_support          boolean,
  is_premium           boolean not null default false,
  calm_mode_safe       boolean not null default true,
  requires_parent_help boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create or replace trigger activities_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();

-- =============================================================
-- 2. Child tables
-- =============================================================

-- child_learning_plans ----------------------------------------------
create table if not exists public.child_learning_plans (
  id                     uuid primary key default gen_random_uuid(),
  profile_id             uuid not null references public.profiles(id) on delete cascade,
  class_level_id         uuid not null references public.class_levels(id) on delete cascade,
  intensity              text not null default 'medium',
  session_length_minutes integer not null default 10,
  subject_area_ids       text[] not null default '{}',
  is_active              boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create or replace trigger child_learning_plans_updated_at
  before update on public.child_learning_plans
  for each row execute function public.set_updated_at();

-- child_progress ----------------------------------------------------
create table if not exists public.child_progress (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid not null references public.profiles(id) on delete cascade,
  activity_id       uuid not null references public.activities(id) on delete cascade,
  lesson_id         uuid not null references public.lessons(id) on delete cascade,
  module_id         uuid not null references public.study_modules(id) on delete cascade,
  completed         boolean not null default false,
  score             integer,
  attempts          integer not null default 0,
  last_attempted_at timestamptz,
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create or replace trigger child_progress_updated_at
  before update on public.child_progress
  for each row execute function public.set_updated_at();

-- child_preferences -------------------------------------------------
create table if not exists public.child_preferences (
  id                       uuid primary key default gen_random_uuid(),
  profile_id               uuid not null unique references public.profiles(id) on delete cascade,
  preferred_difficulty      integer not null default 2,
  favorite_subject_ids     text[] not null default '{}',
  repeat_completed_lessons boolean not null default true,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create or replace trigger child_preferences_updated_at
  before update on public.child_preferences
  for each row execute function public.set_updated_at();

-- =============================================================
-- 3. Indexes
-- =============================================================

-- curriculum FK indexes
create index if not exists idx_year_categories_updated_at   on public.year_categories(updated_at);

create index if not exists idx_class_levels_year_category_id on public.class_levels(year_category_id);
create index if not exists idx_class_levels_updated_at       on public.class_levels(updated_at);

create index if not exists idx_subject_areas_updated_at on public.subject_areas(updated_at);

create index if not exists idx_study_modules_subject_area_id on public.study_modules(subject_area_id);
create index if not exists idx_study_modules_class_level_id  on public.study_modules(class_level_id);
create index if not exists idx_study_modules_updated_at      on public.study_modules(updated_at);

create index if not exists idx_lessons_module_id   on public.lessons(module_id);
create index if not exists idx_lessons_updated_at  on public.lessons(updated_at);

create index if not exists idx_activities_lesson_id  on public.activities(lesson_id);
create index if not exists idx_activities_updated_at on public.activities(updated_at);

-- child table indexes
create index if not exists idx_child_learning_plans_profile_id     on public.child_learning_plans(profile_id);
create index if not exists idx_child_learning_plans_class_level_id on public.child_learning_plans(class_level_id);
create index if not exists idx_child_learning_plans_updated_at     on public.child_learning_plans(updated_at);

create index if not exists idx_child_progress_profile_id  on public.child_progress(profile_id);
create index if not exists idx_child_progress_activity_id on public.child_progress(activity_id);
create index if not exists idx_child_progress_lesson_id   on public.child_progress(lesson_id);
create index if not exists idx_child_progress_module_id   on public.child_progress(module_id);
create index if not exists idx_child_progress_updated_at  on public.child_progress(updated_at);

create index if not exists idx_child_preferences_profile_id on public.child_preferences(profile_id);
create index if not exists idx_child_preferences_updated_at on public.child_preferences(updated_at);

-- =============================================================
-- 4. Row-Level Security
-- =============================================================

-- ---- Curriculum tables: read-only for authenticated users --------

-- year_categories ---------------------------------------------------
alter table public.year_categories enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'year_categories' and policyname = 'Authenticated users can view year categories'
  ) then
    create policy "Authenticated users can view year categories"
      on public.year_categories for select
      to authenticated
      using (true);
  end if;
end $$;

-- class_levels ------------------------------------------------------
alter table public.class_levels enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'class_levels' and policyname = 'Authenticated users can view class levels'
  ) then
    create policy "Authenticated users can view class levels"
      on public.class_levels for select
      to authenticated
      using (true);
  end if;
end $$;

-- subject_areas -----------------------------------------------------
alter table public.subject_areas enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'subject_areas' and policyname = 'Authenticated users can view subject areas'
  ) then
    create policy "Authenticated users can view subject areas"
      on public.subject_areas for select
      to authenticated
      using (true);
  end if;
end $$;

-- study_modules -----------------------------------------------------
alter table public.study_modules enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'study_modules' and policyname = 'Authenticated users can view study modules'
  ) then
    create policy "Authenticated users can view study modules"
      on public.study_modules for select
      to authenticated
      using (true);
  end if;
end $$;

-- lessons -----------------------------------------------------------
alter table public.lessons enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'lessons' and policyname = 'Authenticated users can view lessons'
  ) then
    create policy "Authenticated users can view lessons"
      on public.lessons for select
      to authenticated
      using (true);
  end if;
end $$;

-- activities --------------------------------------------------------
alter table public.activities enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'activities' and policyname = 'Authenticated users can view activities'
  ) then
    create policy "Authenticated users can view activities"
      on public.activities for select
      to authenticated
      using (true);
  end if;
end $$;

-- ---- Child tables: full CRUD for own rows -------------------------

-- child_learning_plans ----------------------------------------------
alter table public.child_learning_plans enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'child_learning_plans' and policyname = 'Users can view own learning plans'
  ) then
    create policy "Users can view own learning plans"
      on public.child_learning_plans for select
      using (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'child_learning_plans' and policyname = 'Users can insert own learning plans'
  ) then
    create policy "Users can insert own learning plans"
      on public.child_learning_plans for insert
      with check (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'child_learning_plans' and policyname = 'Users can update own learning plans'
  ) then
    create policy "Users can update own learning plans"
      on public.child_learning_plans for update
      using (profile_id = auth.uid())
      with check (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'child_learning_plans' and policyname = 'Users can delete own learning plans'
  ) then
    create policy "Users can delete own learning plans"
      on public.child_learning_plans for delete
      using (profile_id = auth.uid());
  end if;
end $$;

-- child_progress ----------------------------------------------------
alter table public.child_progress enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'child_progress' and policyname = 'Users can view own progress'
  ) then
    create policy "Users can view own progress"
      on public.child_progress for select
      using (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'child_progress' and policyname = 'Users can insert own progress'
  ) then
    create policy "Users can insert own progress"
      on public.child_progress for insert
      with check (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'child_progress' and policyname = 'Users can update own progress'
  ) then
    create policy "Users can update own progress"
      on public.child_progress for update
      using (profile_id = auth.uid())
      with check (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'child_progress' and policyname = 'Users can delete own progress'
  ) then
    create policy "Users can delete own progress"
      on public.child_progress for delete
      using (profile_id = auth.uid());
  end if;
end $$;

-- child_preferences -------------------------------------------------
alter table public.child_preferences enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'child_preferences' and policyname = 'Users can view own preferences'
  ) then
    create policy "Users can view own preferences"
      on public.child_preferences for select
      using (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'child_preferences' and policyname = 'Users can insert own preferences'
  ) then
    create policy "Users can insert own preferences"
      on public.child_preferences for insert
      with check (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'child_preferences' and policyname = 'Users can update own preferences'
  ) then
    create policy "Users can update own preferences"
      on public.child_preferences for update
      using (profile_id = auth.uid())
      with check (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'child_preferences' and policyname = 'Users can delete own preferences'
  ) then
    create policy "Users can delete own preferences"
      on public.child_preferences for delete
      using (profile_id = auth.uid());
  end if;
end $$;
