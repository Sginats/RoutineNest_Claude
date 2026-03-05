// RoutineNest — Typed Supabase helpers
// Uses the browser-safe client from supabaseClient.ts

import { supabase } from "./supabaseClient";
import type {
  Profile,
  Card,
  CardInsert,
  Schedule,
  ScheduleItem,
  ScheduleItemInsert,
  Settings,
  SettingsPatch,
} from "./types";

// ---------------------------------------------------------------------------
// Internal helper — guarantees a live client or throws
// ---------------------------------------------------------------------------
function client() {
  if (!supabase) throw new Error("Supabase client is not initialised");
  return supabase;
}

// ---------------------------------------------------------------------------
// Profiles
// ---------------------------------------------------------------------------
export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await client()
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Profile[];
}

export async function createProfile(name: string): Promise<Profile> {
  const { data, error } = await client()
    .from("profiles")
    .insert({ display_name: name })
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
export async function getSettings(profileId: string): Promise<Settings | null> {
  const { data, error } = await client()
    .from("settings")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  return data as Settings | null;
}

export async function upsertSettings(
  profileId: string,
  patch: SettingsPatch,
): Promise<Settings> {
  const { data, error } = await client()
    .from("settings")
    .upsert({ profile_id: profileId, ...patch }, { onConflict: "profile_id" })
    .select()
    .single();
  if (error) throw error;
  return data as Settings;
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
export async function getCards(
  profileId: string,
  category?: string,
): Promise<Card[]> {
  let query = client()
    .from("cards")
    .select("*")
    .eq("profile_id", profileId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Card[];
}

export async function upsertCard(card: CardInsert): Promise<Card> {
  const { data, error } = await client()
    .from("cards")
    .upsert(card)
    .select()
    .single();
  if (error) throw error;
  return data as Card;
}

// ---------------------------------------------------------------------------
// Schedules
// ---------------------------------------------------------------------------
export async function getSchedules(profileId: string): Promise<Schedule[]> {
  const { data, error } = await client()
    .from("schedules")
    .select("*")
    .eq("profile_id", profileId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Schedule[];
}

// ---------------------------------------------------------------------------
// Schedule Items
// ---------------------------------------------------------------------------
export async function getScheduleItems(
  scheduleId: string,
): Promise<ScheduleItem[]> {
  const { data, error } = await client()
    .from("schedule_items")
    .select("*")
    .eq("schedule_id", scheduleId)
    .order("position", { ascending: true });
  if (error) throw error;
  return data as ScheduleItem[];
}

export async function upsertScheduleItem(
  item: ScheduleItemInsert,
): Promise<ScheduleItem> {
  const { data, error } = await client()
    .from("schedule_items")
    .upsert(item)
    .select()
    .single();
  if (error) throw error;
  return data as ScheduleItem;
}

export async function updateScheduleItemDone(
  itemId: string,
  done: boolean,
): Promise<ScheduleItem> {
  const { data, error } = await client()
    .from("schedule_items")
    .update({ is_complete: done })
    .eq("id", itemId)
    .select()
    .single();
  if (error) throw error;
  return data as ScheduleItem;
}
