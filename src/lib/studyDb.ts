// RoutineNest — Typed Supabase helpers for study plan tables
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
  ChildLearningPlan,
  ChildLearningPlanInsert,
  ChildProgress,
  ChildProgressInsert,
  ChildPreferences,
  ChildPreferencesPatch,
} from "./studyTypes";

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
// Child Learning Plan
// ---------------------------------------------------------------------------

export async function getChildLearningPlan(
  profileId: string,
): Promise<ChildLearningPlan | null> {
  const { data, error } = await client()
    .from("child_learning_plans")
    .select("*")
    .eq("profile_id", profileId)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data as ChildLearningPlan | null;
}

export async function upsertChildLearningPlan(
  plan: ChildLearningPlanInsert,
): Promise<ChildLearningPlan> {
  const now = new Date().toISOString();
  const id = plan.id ?? generateUUID();
  const payload = { ...plan, id };

  return withOfflineQueue(
    async () => {
      const { data, error } = await client()
        .from("child_learning_plans")
        .upsert(payload, { onConflict: "profile_id" })
        .select()
        .single();
      if (error) throw error;
      return data as ChildLearningPlan;
    },
    () => ({
      mutation: {
        timestamp: now,
        table: "child_learning_plans",
        operation: "upsert" as const,
        payload: payload as unknown as Record<string, unknown>,
        onConflict: "profile_id",
        matchColumn: "profile_id",
        matchValue: plan.profile_id,
      },
      fallback: {
        id,
        profile_id: plan.profile_id,
        class_level_id: plan.class_level_id,
        intensity: plan.intensity,
        session_length_minutes: plan.session_length_minutes,
        subject_area_ids: plan.subject_area_ids,
        is_active: plan.is_active,
        created_at: now,
        updated_at: now,
      } as ChildLearningPlan,
    }),
  );
}

// ---------------------------------------------------------------------------
// Child Progress
// ---------------------------------------------------------------------------

export async function getChildProgress(
  profileId: string,
): Promise<ChildProgress[]> {
  const { data, error } = await client()
    .from("child_progress")
    .select("*")
    .eq("profile_id", profileId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as ChildProgress[];
}

export async function upsertChildProgress(
  progress: ChildProgressInsert,
): Promise<ChildProgress> {
  const now = new Date().toISOString();
  const id = progress.id ?? generateUUID();
  const payload = { ...progress, id };

  return withOfflineQueue(
    async () => {
      const { data, error } = await client()
        .from("child_progress")
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as ChildProgress;
    },
    () => ({
      mutation: {
        timestamp: now,
        table: "child_progress",
        operation: "upsert" as const,
        payload: payload as unknown as Record<string, unknown>,
        matchColumn: "id",
        matchValue: id,
      },
      fallback: {
        id,
        profile_id: progress.profile_id,
        activity_id: progress.activity_id,
        lesson_id: progress.lesson_id,
        module_id: progress.module_id,
        completed: progress.completed,
        score: progress.score ?? null,
        attempts: progress.attempts,
        last_attempted_at: progress.last_attempted_at ?? null,
        completed_at: progress.completed_at ?? null,
        created_at: now,
        updated_at: now,
      } as ChildProgress,
    }),
  );
}

// ---------------------------------------------------------------------------
// Child Preferences
// ---------------------------------------------------------------------------

export async function getChildPreferences(
  profileId: string,
): Promise<ChildPreferences | null> {
  const { data, error } = await client()
    .from("child_preferences")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  return data as ChildPreferences | null;
}

export async function upsertChildPreferences(
  profileId: string,
  patch: ChildPreferencesPatch,
): Promise<ChildPreferences> {
  const now = new Date().toISOString();
  const payload = { profile_id: profileId, ...patch };

  return withOfflineQueue(
    async () => {
      const { data, error } = await client()
        .from("child_preferences")
        .upsert(payload, { onConflict: "profile_id" })
        .select()
        .single();
      if (error) throw error;
      return data as ChildPreferences;
    },
    () => ({
      mutation: {
        timestamp: now,
        table: "child_preferences",
        operation: "upsert" as const,
        payload: payload as unknown as Record<string, unknown>,
        onConflict: "profile_id",
        matchColumn: "profile_id",
        matchValue: profileId,
      },
      fallback: {
        id: "",
        profile_id: profileId,
        preferred_difficulty: 1,
        favorite_subject_ids: [],
        repeat_completed_lessons: false,
        created_at: now,
        updated_at: now,
        ...patch,
      } as ChildPreferences,
    }),
  );
}
