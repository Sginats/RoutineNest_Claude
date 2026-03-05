-- Add grid_size and sound_enabled columns to settings table
alter table public.settings
  add column grid_size integer not null default 3
    check (grid_size in (2, 3, 4)),
  add column sound_enabled boolean not null default true;
