// RoutineNest — Database row types
// Mirrors supabase/migrations/20260305000000_initial_schema.sql

export interface Profile {
  id: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  profile_id: string;
  label: string;
  tts_text: string | null;
  image_url: string | null;
  category: string;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Schedule {
  id: string;
  profile_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ScheduleItem {
  id: string;
  schedule_id: string;
  card_id: string;
  position: number;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reward {
  id: string;
  profile_id: string;
  stars: number;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  profile_id: string;
  calm_mode: boolean;
  big_button_mode: boolean;
  parent_lock_enabled: boolean;
  grid_size: number;
  sound_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Insert/upsert helper types (omit server-generated fields)

export type CardInsert = Omit<Card, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

export type ScheduleItemInsert = Omit<
  ScheduleItem,
  "id" | "created_at" | "updated_at"
> & {
  id?: string;
};

export type SettingsPatch = Partial<
  Pick<Settings, "calm_mode" | "big_button_mode" | "parent_lock_enabled" | "grid_size" | "sound_enabled">
>;
