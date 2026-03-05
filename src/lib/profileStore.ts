// RoutineNest — Lightweight localStorage store for the active profile ID.

const STORAGE_KEY = "routinenest_active_profile_id";

/** Read the persisted active profile ID (or null). */
export function getActiveProfileId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

/** Persist the active profile ID. */
export function setActiveProfileId(profileId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, profileId);
}

/** Clear the persisted profile ID. */
export function clearActiveProfileId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
