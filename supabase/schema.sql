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
-- 5. Storage bucket: card-icons
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
