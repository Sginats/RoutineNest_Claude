-- RoutineNest — STEP 7: Initial schema, triggers, RLS, and indexes
-- Run this in the Supabase SQL editor as a single script.

-- =============================================================
-- 0. Extensions
-- =============================================================
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
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- cards ----------------------------------------------------------
create table public.cards (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  label       text not null,
  image_url   text,
  category    text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create trigger cards_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

-- schedules ------------------------------------------------------
create table public.schedules (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create trigger schedules_updated_at
  before update on public.schedules
  for each row execute function public.set_updated_at();

-- schedule_items -------------------------------------------------
create table public.schedule_items (
  id          uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules(id) on delete cascade,
  card_id     uuid not null references public.cards(id) on delete cascade,
  position    integer not null default 0,
  is_complete boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger schedule_items_updated_at
  before update on public.schedule_items
  for each row execute function public.set_updated_at();

-- rewards --------------------------------------------------------
create table public.rewards (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  stars       integer not null default 0,
  reason      text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger rewards_updated_at
  before update on public.rewards
  for each row execute function public.set_updated_at();

-- settings -------------------------------------------------------
create table public.settings (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null unique references public.profiles(id) on delete cascade,
  calm_mode           boolean not null default false,
  big_button_mode     boolean not null default false,
  parent_lock_enabled boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger settings_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- =============================================================
-- 3. Indexes
-- =============================================================
create index idx_cards_profile_id   on public.cards(profile_id);
create index idx_cards_updated_at   on public.cards(updated_at);

create index idx_schedules_profile_id on public.schedules(profile_id);
create index idx_schedules_updated_at on public.schedules(updated_at);

create index idx_schedule_items_schedule_id on public.schedule_items(schedule_id);
create index idx_schedule_items_card_id     on public.schedule_items(card_id);
create index idx_schedule_items_updated_at  on public.schedule_items(updated_at);

create index idx_rewards_profile_id on public.rewards(profile_id);
create index idx_rewards_updated_at on public.rewards(updated_at);

create index idx_settings_profile_id on public.settings(profile_id);
create index idx_settings_updated_at on public.settings(updated_at);

-- =============================================================
-- 4. Row-Level Security
-- =============================================================

-- profiles -------------------------------------------------------
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Users can delete own profile"
  on public.profiles for delete
  using (id = auth.uid());

-- cards ----------------------------------------------------------
alter table public.cards enable row level security;

create policy "Users can view own cards"
  on public.cards for select
  using (profile_id = auth.uid());

create policy "Users can insert own cards"
  on public.cards for insert
  with check (profile_id = auth.uid());

create policy "Users can update own cards"
  on public.cards for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "Users can delete own cards"
  on public.cards for delete
  using (profile_id = auth.uid());

-- schedules ------------------------------------------------------
alter table public.schedules enable row level security;

create policy "Users can view own schedules"
  on public.schedules for select
  using (profile_id = auth.uid());

create policy "Users can insert own schedules"
  on public.schedules for insert
  with check (profile_id = auth.uid());

create policy "Users can update own schedules"
  on public.schedules for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "Users can delete own schedules"
  on public.schedules for delete
  using (profile_id = auth.uid());

-- schedule_items -------------------------------------------------
alter table public.schedule_items enable row level security;

create policy "Users can view own schedule items"
  on public.schedule_items for select
  using (
    exists (
      select 1 from public.schedules
      where schedules.id = schedule_items.schedule_id
        and schedules.profile_id = auth.uid()
    )
  );

create policy "Users can insert own schedule items"
  on public.schedule_items for insert
  with check (
    exists (
      select 1 from public.schedules
      where schedules.id = schedule_items.schedule_id
        and schedules.profile_id = auth.uid()
    )
  );

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

create policy "Users can delete own schedule items"
  on public.schedule_items for delete
  using (
    exists (
      select 1 from public.schedules
      where schedules.id = schedule_items.schedule_id
        and schedules.profile_id = auth.uid()
    )
  );

-- rewards --------------------------------------------------------
alter table public.rewards enable row level security;

create policy "Users can view own rewards"
  on public.rewards for select
  using (profile_id = auth.uid());

create policy "Users can insert own rewards"
  on public.rewards for insert
  with check (profile_id = auth.uid());

create policy "Users can update own rewards"
  on public.rewards for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "Users can delete own rewards"
  on public.rewards for delete
  using (profile_id = auth.uid());

-- settings -------------------------------------------------------
alter table public.settings enable row level security;

create policy "Users can view own settings"
  on public.settings for select
  using (profile_id = auth.uid());

create policy "Users can insert own settings"
  on public.settings for insert
  with check (profile_id = auth.uid());

create policy "Users can update own settings"
  on public.settings for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "Users can delete own settings"
  on public.settings for delete
  using (profile_id = auth.uid());
