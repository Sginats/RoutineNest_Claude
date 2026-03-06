-- RoutineNest — Consolidated reproducible schema
-- This file is the single source of truth for the database schema.
-- Run it in the Supabase SQL editor (or via `supabase db reset`) to create
-- a fresh database from scratch.  It combines all incremental migrations in
-- supabase/migrations/ into one idempotent script.
--
-- Storage: the app uses a public bucket named "card-icons".  Create it in the
-- Supabase dashboard (Storage → New bucket, name: card-icons, Public: on) or
-- apply supabase/migrations/20260305000003_card_icons_bucket.sql.

-- =============================================================
-- 0. Extensions
-- =============================================================
-- pgcrypto is retained for compatibility with older Postgres deployments;
-- gen_random_uuid() is a core function in Postgres 13+ and does not require it.
create extension if not exists "pgcrypto";

-- =============================================================
-- 1. Helper: auto-update updated_at trigger function
-- =============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================
-- 2. Tables
-- =============================================================

-- profiles -------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create or replace trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- cards ----------------------------------------------------------
create table if not exists public.cards (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label      text not null,
  image_url  text,
  category   text not null default '',
  tts_text   text,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create or replace trigger cards_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

-- schedules ------------------------------------------------------
create table if not exists public.schedules (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create or replace trigger schedules_updated_at
  before update on public.schedules
  for each row execute function public.set_updated_at();

-- schedule_items -------------------------------------------------
create table if not exists public.schedule_items (
  id          uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules(id) on delete cascade,
  card_id     uuid not null references public.cards(id) on delete cascade,
  position    integer not null default 0,
  is_complete boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace trigger schedule_items_updated_at
  before update on public.schedule_items
  for each row execute function public.set_updated_at();

-- rewards --------------------------------------------------------
create table if not exists public.rewards (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  stars      integer not null default 0,
  reason     text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger rewards_updated_at
  before update on public.rewards
  for each row execute function public.set_updated_at();

-- settings -------------------------------------------------------
create table if not exists public.settings (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null unique references public.profiles(id) on delete cascade,
  calm_mode           boolean not null default false,
  big_button_mode     boolean not null default false,
  parent_lock_enabled boolean not null default true,
  grid_size           integer not null default 3 check (grid_size in (2, 3, 4)),
  sound_enabled       boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create or replace trigger settings_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- =============================================================
-- 3. Indexes
-- =============================================================
create index if not exists idx_cards_profile_id   on public.cards(profile_id);
create index if not exists idx_cards_updated_at   on public.cards(updated_at);

create index if not exists idx_schedules_profile_id on public.schedules(profile_id);
create index if not exists idx_schedules_updated_at on public.schedules(updated_at);

create index if not exists idx_schedule_items_schedule_id on public.schedule_items(schedule_id);
create index if not exists idx_schedule_items_card_id     on public.schedule_items(card_id);
create index if not exists idx_schedule_items_updated_at  on public.schedule_items(updated_at);

create index if not exists idx_rewards_profile_id on public.rewards(profile_id);
create index if not exists idx_rewards_updated_at on public.rewards(updated_at);

create index if not exists idx_settings_profile_id on public.settings(profile_id);
create index if not exists idx_settings_updated_at on public.settings(updated_at);

-- study plan: curriculum FK indexes
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

-- study plan: child table indexes
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

-- profiles -------------------------------------------------------
alter table public.profiles enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can view own profile'
  ) then
    create policy "Users can view own profile"
      on public.profiles for select
      using (id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can insert own profile'
  ) then
    create policy "Users can insert own profile"
      on public.profiles for insert
      with check (id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can update own profile'
  ) then
    create policy "Users can update own profile"
      on public.profiles for update
      using (id = auth.uid())
      with check (id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can delete own profile'
  ) then
    create policy "Users can delete own profile"
      on public.profiles for delete
      using (id = auth.uid());
  end if;
end $$;

-- cards ----------------------------------------------------------
alter table public.cards enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'cards' and policyname = 'Users can view own cards'
  ) then
    create policy "Users can view own cards"
      on public.cards for select
      using (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'cards' and policyname = 'Users can insert own cards'
  ) then
    create policy "Users can insert own cards"
      on public.cards for insert
      with check (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'cards' and policyname = 'Users can update own cards'
  ) then
    create policy "Users can update own cards"
      on public.cards for update
      using (profile_id = auth.uid())
      with check (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'cards' and policyname = 'Users can delete own cards'
  ) then
    create policy "Users can delete own cards"
      on public.cards for delete
      using (profile_id = auth.uid());
  end if;
end $$;

-- schedules ------------------------------------------------------
alter table public.schedules enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'schedules' and policyname = 'Users can view own schedules'
  ) then
    create policy "Users can view own schedules"
      on public.schedules for select
      using (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'schedules' and policyname = 'Users can insert own schedules'
  ) then
    create policy "Users can insert own schedules"
      on public.schedules for insert
      with check (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'schedules' and policyname = 'Users can update own schedules'
  ) then
    create policy "Users can update own schedules"
      on public.schedules for update
      using (profile_id = auth.uid())
      with check (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'schedules' and policyname = 'Users can delete own schedules'
  ) then
    create policy "Users can delete own schedules"
      on public.schedules for delete
      using (profile_id = auth.uid());
  end if;
end $$;

-- schedule_items -------------------------------------------------
alter table public.schedule_items enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'schedule_items' and policyname = 'Users can view own schedule items'
  ) then
    create policy "Users can view own schedule items"
      on public.schedule_items for select
      using (
        exists (
          select 1 from public.schedules
          where schedules.id = schedule_items.schedule_id
            and schedules.profile_id = auth.uid()
        )
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'schedule_items' and policyname = 'Users can insert own schedule items'
  ) then
    create policy "Users can insert own schedule items"
      on public.schedule_items for insert
      with check (
        exists (
          select 1 from public.schedules
          where schedules.id = schedule_items.schedule_id
            and schedules.profile_id = auth.uid()
        )
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'schedule_items' and policyname = 'Users can update own schedule items'
  ) then
    create policy "Users can update own schedule items"
      on public.schedule_items for update
      using (
        exists (
          select 1 from public.schedules
          where schedules.id = schedule_items.schedule_id
            and schedules.profile_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.schedules
          where schedules.id = schedule_items.schedule_id
            and schedules.profile_id = auth.uid()
        )
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'schedule_items' and policyname = 'Users can delete own schedule items'
  ) then
    create policy "Users can delete own schedule items"
      on public.schedule_items for delete
      using (
        exists (
          select 1 from public.schedules
          where schedules.id = schedule_items.schedule_id
            and schedules.profile_id = auth.uid()
        )
      );
  end if;
end $$;

-- rewards --------------------------------------------------------
alter table public.rewards enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'rewards' and policyname = 'Users can view own rewards'
  ) then
    create policy "Users can view own rewards"
      on public.rewards for select
      using (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'rewards' and policyname = 'Users can insert own rewards'
  ) then
    create policy "Users can insert own rewards"
      on public.rewards for insert
      with check (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'rewards' and policyname = 'Users can update own rewards'
  ) then
    create policy "Users can update own rewards"
      on public.rewards for update
      using (profile_id = auth.uid())
      with check (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'rewards' and policyname = 'Users can delete own rewards'
  ) then
    create policy "Users can delete own rewards"
      on public.rewards for delete
      using (profile_id = auth.uid());
  end if;
end $$;

-- settings -------------------------------------------------------
alter table public.settings enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'settings' and policyname = 'Users can view own settings'
  ) then
    create policy "Users can view own settings"
      on public.settings for select
      using (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'settings' and policyname = 'Users can insert own settings'
  ) then
    create policy "Users can insert own settings"
      on public.settings for insert
      with check (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'settings' and policyname = 'Users can update own settings'
  ) then
    create policy "Users can update own settings"
      on public.settings for update
      using (profile_id = auth.uid())
      with check (profile_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'settings' and policyname = 'Users can delete own settings'
  ) then
    create policy "Users can delete own settings"
      on public.settings for delete
      using (profile_id = auth.uid());
  end if;
end $$;

-- =============================================================
-- 5. Study plan tables
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

-- ---- Study plan: curriculum tables (read-only for authenticated) ---

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

-- ---- Study plan: child tables (full CRUD) -------------------------

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

-- =============================================================
-- 6. Storage bucket: card-icons
-- =============================================================
-- Public bucket for card icon images. Files are stored as
-- {userId}/{timestamp}-{random}.{ext} so ownership is path-encoded.

insert into storage.buckets (id, name, public)
values ('card-icons', 'card-icons', true)
on conflict (id) do nothing;

-- Public SELECT — image URLs are served without signed auth tokens
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read card-icons'
  ) then
    create policy "Public read card-icons"
      on storage.objects for select
      using (bucket_id = 'card-icons');
  end if;
end $$;

-- Authenticated INSERT — any logged-in user may upload
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated insert card-icons'
  ) then
    create policy "Authenticated insert card-icons"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'card-icons');
  end if;
end $$;

-- Owner UPDATE — user may overwrite their own files
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Owner update card-icons'
  ) then
    create policy "Owner update card-icons"
      on storage.objects for update
      to authenticated
      using (
        bucket_id = 'card-icons'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

-- Owner DELETE — user may delete their own files
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Owner delete card-icons'
  ) then
    create policy "Owner delete card-icons"
      on storage.objects for delete
      to authenticated
      using (
        bucket_id = 'card-icons'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;
