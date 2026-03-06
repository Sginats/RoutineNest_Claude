-- RoutineNest — Weekly plan entries table
-- Allows parents to assign subject areas to specific days of the week.
-- Each entry links a learning plan + day-of-week to a subject area.
-- Idempotent: safe to run multiple times.

-- =============================================================
-- 1. Table
-- =============================================================

create table if not exists public.weekly_plan_entries (
  id               uuid primary key default gen_random_uuid(),
  learning_plan_id uuid not null references public.child_learning_plans(id) on delete cascade,
  day              text not null check (day in ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
  subject_area_id  text not null,
  "order"          integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create or replace trigger weekly_plan_entries_updated_at
  before update on public.weekly_plan_entries
  for each row execute function public.set_updated_at();

-- =============================================================
-- 2. Indexes
-- =============================================================

create index if not exists idx_weekly_plan_entries_learning_plan_id on public.weekly_plan_entries(learning_plan_id);
create index if not exists idx_weekly_plan_entries_day              on public.weekly_plan_entries(day);
create index if not exists idx_weekly_plan_entries_updated_at       on public.weekly_plan_entries(updated_at);

-- =============================================================
-- 3. Row-Level Security
-- =============================================================

alter table public.weekly_plan_entries enable row level security;

-- Users can manage weekly plan entries via their learning plan
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'weekly_plan_entries' and policyname = 'Users can view own weekly plan entries'
  ) then
    create policy "Users can view own weekly plan entries"
      on public.weekly_plan_entries for select
      using (
        learning_plan_id in (
          select id from public.child_learning_plans where profile_id = auth.uid()
        )
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'weekly_plan_entries' and policyname = 'Users can insert own weekly plan entries'
  ) then
    create policy "Users can insert own weekly plan entries"
      on public.weekly_plan_entries for insert
      with check (
        learning_plan_id in (
          select id from public.child_learning_plans where profile_id = auth.uid()
        )
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'weekly_plan_entries' and policyname = 'Users can update own weekly plan entries'
  ) then
    create policy "Users can update own weekly plan entries"
      on public.weekly_plan_entries for update
      using (
        learning_plan_id in (
          select id from public.child_learning_plans where profile_id = auth.uid()
        )
      )
      with check (
        learning_plan_id in (
          select id from public.child_learning_plans where profile_id = auth.uid()
        )
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'weekly_plan_entries' and policyname = 'Users can delete own weekly plan entries'
  ) then
    create policy "Users can delete own weekly plan entries"
      on public.weekly_plan_entries for delete
      using (
        learning_plan_id in (
          select id from public.child_learning_plans where profile_id = auth.uid()
        )
      );
  end if;
end $$;
