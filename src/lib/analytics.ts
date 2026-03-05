// RoutineNest — PostHog analytics (opt-out, no session replay)
//
// Tracked events:
//   screen_viewed          { screen: string }
//   schedule_item_completed { item_id: string }
//   aac_card_tapped        { category: string }   ← NO label or tts_text
//
// Opt-out preference is stored in localStorage so it survives across sessions
// without requiring a DB row.

import posthog from "posthog-js";

const STORAGE_KEY = "routinenest_analytics_enabled";

// ---------------------------------------------------------------------------
// Preference helpers (localStorage, SSR-safe)
// ---------------------------------------------------------------------------

export function getAnalyticsEnabled(): boolean {
  if (typeof window === "undefined") return true; // SSR default
  const stored = localStorage.getItem(STORAGE_KEY);
  // Default ON when the key has never been set
  return stored === null ? true : stored === "true";
}

export function setAnalyticsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(enabled));
  if (enabled) {
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
  }
}

// ---------------------------------------------------------------------------
// Initialisation — call once from Providers (client-side only)
// ---------------------------------------------------------------------------

export function initAnalytics(): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return; // Skip in development

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return; // No key configured — silently skip

  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

  posthog.init(key, {
    api_host: host,
    // Never record sessions
    disable_session_recording: true,
    // We fire screen_viewed manually via trackScreen()
    capture_pageview: false,
    // Respect the stored opt-out preference immediately on load
    loaded() {
      if (!getAnalyticsEnabled()) {
        posthog.opt_out_capturing();
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Event helpers
// ---------------------------------------------------------------------------

export function trackScreen(screen: string): void {
  if (typeof window === "undefined") return;
  posthog.capture("screen_viewed", { screen });
}

export function trackScheduleItemCompleted(itemId: string): void {
  if (typeof window === "undefined") return;
  posthog.capture("schedule_item_completed", { item_id: itemId });
}

/** Track an AAC card tap — ONLY the category, never label or tts_text. */
export function trackAACCardTapped(category: string): void {
  if (typeof window === "undefined") return;
  posthog.capture("aac_card_tapped", { category });
}
