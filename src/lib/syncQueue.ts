// RoutineNest — Offline mutation queue + replay (last-write-wins)
// Stores pending writes in IndexedDB. When the browser goes back online
// the queue is replayed against Supabase with a last-write-wins check
// (server updated_at vs. mutation timestamp).

import { get, set } from "idb-keyval";
import { supabase } from "./supabaseClient";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const QUEUE_KEY = "routinenest_sync_queue";
const MAX_RETRIES = 5;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface QueuedMutation {
  id: string;
  /** ISO timestamp — when the user performed the action (used for LWW) */
  timestamp: string;
  table: string;
  operation: "upsert" | "update" | "delete" | "insert_if_not_exists";
  payload: Record<string, unknown>;
  /** Supabase onConflict column (for upsert) */
  onConflict?: string;
  /** Column used for WHERE clause and LWW lookup */
  matchColumn: string;
  /** Value for the matchColumn */
  matchValue: string;
  /** Columns checked for duplicate before insert_if_not_exists */
  duplicateCheckColumns?: string[];
  retries: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Browser-safe online check (returns true during SSR). */
export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

/** Heuristic: does this look like a network / fetch error? */
export function isNetworkError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const msg =
    "message" in err ? String((err as { message: string }).message) : "";
  return /fetch failed|network|Failed to fetch|Load failed|ERR_INTERNET_DISCONNECTED/i.test(
    msg,
  );
}

// ---------------------------------------------------------------------------
// Queue CRUD (IndexedDB via idb-keyval)
// ---------------------------------------------------------------------------
async function loadQueue(): Promise<QueuedMutation[]> {
  try {
    return (await get<QueuedMutation[]>(QUEUE_KEY)) ?? [];
  } catch {
    return [];
  }
}

async function saveQueue(q: QueuedMutation[]): Promise<void> {
  await set(QUEUE_KEY, q);
}

/** Append a mutation to the persistent queue. */
export async function enqueue(
  m: Omit<QueuedMutation, "id" | "retries">,
): Promise<void> {
  const q = await loadQueue();
  q.push({ ...m, id: genId(), retries: 0 });
  await saveQueue(q);
}

/** Number of pending mutations (useful for diagnostics). */
export async function getQueueLength(): Promise<number> {
  return (await loadQueue()).length;
}

// ---------------------------------------------------------------------------
// Replay — process queue against Supabase (FIFO, last-write-wins)
// ---------------------------------------------------------------------------
let _busy = false;

export async function replayQueue(): Promise<number> {
  if (_busy || !supabase || !isOnline()) return 0;
  _busy = true;

  let replayed = 0;
  try {
    const queue = await loadQueue();
    if (queue.length === 0) return 0;

    for (const m of queue) {
      // Drop mutations that exceeded the retry limit
      if (m.retries >= MAX_RETRIES) {
        await remove(m.id);
        continue;
      }
      // Stop if we went offline mid-replay
      if (!isOnline()) break;

      try {
        await replayOne(m);
        await remove(m.id);
        replayed++;
      } catch (err) {
        if (!isOnline()) break;
        await bumpRetry(m.id);
        console.warn("[syncQueue] will retry later:", m.id, err);
      }
    }
  } finally {
    _busy = false;
  }
  return replayed;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
async function remove(id: string): Promise<void> {
  await saveQueue((await loadQueue()).filter((m) => m.id !== id));
}

async function bumpRetry(id: string): Promise<void> {
  const q = await loadQueue();
  const e = q.find((m) => m.id === id);
  if (e) e.retries += 1;
  await saveQueue(q);
}

async function replayOne(m: QueuedMutation): Promise<void> {
  if (!supabase) throw new Error("Supabase not initialized");

  // ---- Last-write-wins: skip if server row is newer ----
  if (
    (m.operation === "upsert" || m.operation === "update") &&
    m.matchValue
  ) {
    const { data: row } = await supabase
      .from(m.table)
      .select("updated_at")
      .eq(m.matchColumn, m.matchValue)
      .maybeSingle();

    if (
      row?.updated_at &&
      new Date(row.updated_at) > new Date(m.timestamp)
    ) {
      // Server data is newer — discard this offline mutation
      return;
    }
  }

  // ---- Apply the mutation ----
  switch (m.operation) {
    case "upsert": {
      const q = m.onConflict
        ? supabase
            .from(m.table)
            .upsert(m.payload, { onConflict: m.onConflict })
        : supabase.from(m.table).upsert(m.payload);
      const { error } = await q;
      if (error) throw error;
      break;
    }
    case "update": {
      const { error } = await supabase
        .from(m.table)
        .update(m.payload)
        .eq(m.matchColumn, m.matchValue);
      if (error) throw error;
      break;
    }
    case "delete": {
      const { error } = await supabase
        .from(m.table)
        .delete()
        .eq(m.matchColumn, m.matchValue);
      if (error) throw error;
      break;
    }
    case "insert_if_not_exists": {
      // Guard against duplicates (e.g. rewards)
      if (m.duplicateCheckColumns?.length) {
        let check = supabase.from(m.table).select("id");
        for (const col of m.duplicateCheckColumns) {
          check = check.eq(col, m.payload[col] as string);
        }
        const { data: dup } = await check.maybeSingle();
        if (dup) return; // already exists — skip
      }
      const { error } = await supabase.from(m.table).insert(m.payload);
      if (error) throw error;
      break;
    }
  }
}
