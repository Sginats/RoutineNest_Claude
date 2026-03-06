// RoutineNest — Typed Supabase helpers
// Uses the browser-safe client from supabaseClient.ts
// Write helpers are offline-aware: if the network is down, mutations are
// enqueued to the persistent sync queue and an optimistic result is returned.

import { supabase } from "./supabaseClient";
import {
  enqueue,
  isOnline,
  isNetworkError,
  type QueuedMutation,
} from "./syncQueue";
import type {
  Profile,
  Card,
  CardInsert,
  Schedule,
  ScheduleItem,
  ScheduleItemInsert,
  Reward,
  Settings,
  SettingsPatch,
  SubscriptionTier,
} from "./types";

// ---------------------------------------------------------------------------
// Internal helper — guarantees a live client or throws
// ---------------------------------------------------------------------------
function client() {
  if (!supabase) throw new Error("Supabase client is not initialized");
  return supabase;
}

// ---------------------------------------------------------------------------
// Offline helper — try remote call, fall back to queue + optimistic value
// ---------------------------------------------------------------------------
function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/**
 * Try the remote Supabase call. If the browser is offline (or we hit a
 * network error), enqueue the mutation and return the provided fallback
 * value so the UI can update optimistically.
 */
async function withOfflineQueue<T>(
  remoteFn: () => Promise<T>,
  offlineDef: () => {
    mutation: Omit<QueuedMutation, "id" | "retries">;
    fallback: T;
  },
): Promise<T> {
  if (!isOnline()) {
    const { mutation, fallback } = offlineDef();
    await enqueue(mutation);
    return fallback;
  }
  try {
    return await remoteFn();
  } catch (err) {
    if (isNetworkError(err) || !isOnline()) {
      const { mutation, fallback } = offlineDef();
      await enqueue(mutation);
      return fallback;
    }
    throw err;
  }
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

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await client()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
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

/**
 * Update the subscription tier for the current user's profile.
 * Offline-aware: if the network is down the mutation is queued and the
 * updated tier is returned optimistically.
 */
export async function updateSubscriptionTier(
  userId: string,
  tier: SubscriptionTier,
): Promise<Profile> {
  const now = new Date().toISOString();

  return withOfflineQueue(
    async () => {
      const { data, error } = await client()
        .from("profiles")
        .update({ subscription_tier: tier })
        .eq("id", userId)
        .select()
        .single();
      if (error) throw error;
      return data as Profile;
    },
    () => ({
      mutation: {
        timestamp: now,
        table: "profiles",
        operation: "update" as const,
        payload: { subscription_tier: tier },
        matchColumn: "id",
        matchValue: userId,
      },
      fallback: {
        id: userId,
        display_name: "",
        subscription_tier: tier,
        created_at: now,
        updated_at: now,
      } as Profile,
    }),
  );
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
  const now = new Date().toISOString();
  const payload = { profile_id: profileId, ...patch };

  return withOfflineQueue(
    async () => {
      const { data, error } = await client()
        .from("settings")
        .upsert(payload, { onConflict: "profile_id" })
        .select()
        .single();
      if (error) throw error;
      return data as Settings;
    },
    () => ({
      mutation: {
        timestamp: now,
        table: "settings",
        operation: "upsert" as const,
        payload: payload as unknown as Record<string, unknown>,
        onConflict: "profile_id",
        matchColumn: "profile_id",
        matchValue: profileId,
      },
      fallback: {
        id: "",
        profile_id: profileId,
        calm_mode: false,
        big_button_mode: false,
        parent_lock_enabled: true,
        grid_size: 3,
        sound_enabled: true,
        created_at: now,
        updated_at: now,
        ...patch,
      } as Settings,
    }),
  );
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
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Card[];
}

export async function upsertCard(card: CardInsert): Promise<Card> {
  const now = new Date().toISOString();
  const id = card.id ?? generateUUID();
  const payload = { ...card, id };

  return withOfflineQueue(
    async () => {
      const { data, error } = await client()
        .from("cards")
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as Card;
    },
    () => ({
      mutation: {
        timestamp: now,
        table: "cards",
        operation: "upsert" as const,
        payload: payload as unknown as Record<string, unknown>,
        matchColumn: "id",
        matchValue: id,
      },
      fallback: {
        ...payload,
        created_at: now,
        updated_at: now,
      } as Card,
    }),
  );
}

export async function softDeleteCard(cardId: string): Promise<void> {
  const now = new Date().toISOString();

  return withOfflineQueue(
    async () => {
      const { error } = await client()
        .from("cards")
        .update({ deleted_at: now })
        .eq("id", cardId);
      if (error) throw error;
    },
    () => ({
      mutation: {
        timestamp: now,
        table: "cards",
        operation: "update" as const,
        payload: { deleted_at: now },
        matchColumn: "id",
        matchValue: cardId,
      },
      fallback: undefined,
    }),
  );
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

export async function createSchedule(
  profileId: string,
  title: string,
): Promise<Schedule> {
  const now = new Date().toISOString();
  const id = generateUUID();

  return withOfflineQueue(
    async () => {
      const { data, error } = await client()
        .from("schedules")
        .insert({ profile_id: profileId, title })
        .select()
        .single();
      if (error) throw error;
      return data as Schedule;
    },
    () => ({
      mutation: {
        timestamp: now,
        table: "schedules",
        operation: "upsert" as const,
        payload: { id, profile_id: profileId, title } as unknown as Record<
          string,
          unknown
        >,
        matchColumn: "id",
        matchValue: id,
      },
      fallback: {
        id,
        profile_id: profileId,
        title,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      } as Schedule,
    }),
  );
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
  const now = new Date().toISOString();
  const id = item.id ?? generateUUID();
  const payload = { ...item, id };

  return withOfflineQueue(
    async () => {
      const { data, error } = await client()
        .from("schedule_items")
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as ScheduleItem;
    },
    () => ({
      mutation: {
        timestamp: now,
        table: "schedule_items",
        operation: "upsert" as const,
        payload: payload as unknown as Record<string, unknown>,
        matchColumn: "id",
        matchValue: id,
      },
      fallback: {
        ...payload,
        created_at: now,
        updated_at: now,
      } as ScheduleItem,
    }),
  );
}

export async function deleteScheduleItem(itemId: string): Promise<void> {
  const now = new Date().toISOString();

  return withOfflineQueue(
    async () => {
      const { error } = await client()
        .from("schedule_items")
        .delete()
        .eq("id", itemId);
      if (error) throw error;
    },
    () => ({
      mutation: {
        timestamp: now,
        table: "schedule_items",
        operation: "delete" as const,
        payload: {},
        matchColumn: "id",
        matchValue: itemId,
      },
      fallback: undefined,
    }),
  );
}

export async function updateScheduleItemDone(
  itemId: string,
  done: boolean,
): Promise<ScheduleItem> {
  const now = new Date().toISOString();

  return withOfflineQueue(
    async () => {
      const { data, error } = await client()
        .from("schedule_items")
        .update({ is_complete: done })
        .eq("id", itemId)
        .select()
        .single();
      if (error) throw error;
      return data as ScheduleItem;
    },
    () => ({
      mutation: {
        timestamp: now,
        table: "schedule_items",
        operation: "update" as const,
        payload: { is_complete: done },
        matchColumn: "id",
        matchValue: itemId,
      },
      // Optimistic placeholder — the real UI state is set by onMutate in the
      // calling mutation hook, so these empty fields are never rendered.
      fallback: {
        card_id: "",
        position: 0,
        is_complete: done,
        created_at: now,
        updated_at: now,
      } as ScheduleItem,
    }),
  );
}

// ---------------------------------------------------------------------------
// Rewards
// ---------------------------------------------------------------------------
export async function getRewards(profileId: string): Promise<Reward[]> {
  const { data, error } = await client()
    .from("rewards")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Reward[];
}

/**
 * Insert a reward row only if one with the same reason doesn't already exist.
 * This prevents double-counting when an item is toggled done more than once.
 * When offline, the mutation is enqueued and replayed with a duplicate check.
 */
export async function addRewardIfNew(
  profileId: string,
  stars: number,
  reason: string,
): Promise<Reward | null> {
  const now = new Date().toISOString();

  return withOfflineQueue(
    async () => {
      const { data: existing } = await client()
        .from("rewards")
        .select("id")
        .eq("profile_id", profileId)
        .eq("reason", reason)
        .maybeSingle();

      if (existing) return null;

      const { data, error } = await client()
        .from("rewards")
        .insert({ profile_id: profileId, stars, reason })
        .select()
        .single();
      if (error) throw error;
      return data as Reward;
    },
    () => ({
      mutation: {
        timestamp: now,
        table: "rewards",
        operation: "insert_if_not_exists" as const,
        payload: {
          profile_id: profileId,
          stars,
          reason,
        } as unknown as Record<string, unknown>,
        duplicateCheckColumns: ["profile_id", "reason"],
        matchColumn: "id",
        matchValue: "",
      },
      fallback: null,
    }),
  );
}
