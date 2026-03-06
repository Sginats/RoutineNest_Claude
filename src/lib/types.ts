// RoutineNest — Database row types
// Mirrors supabase/migrations/20260305000000_initial_schema.sql

/** Subscription tier for the account owner (parent/caregiver).
 *  - free: basic routines + AAC (always free, never gated)
 *  - premium: full study curriculum + advanced learning plans + analytics
 */
export type SubscriptionTier = "free" | "premium";

export interface Profile {
  id: string;
  display_name: string;
  subscription_tier: SubscriptionTier;
  /**
   * Stripe customer ID — populated by the billing backend when a Checkout
   * Session is created. Never set from the client directly.
   */
  stripe_customer_id: string | null;
  /**
   * Stripe subscription ID — set by the webhook handler after the first
   * successful payment.
   */
  stripe_subscription_id: string | null;
  /**
   * Current billing status synced from Stripe via webhooks.
   * See BillingStatus in src/lib/billing.ts for full description.
   */
  subscription_status: string | null;
  /**
   * ISO timestamp of the end of the current billing period.
   * Access may still be granted until this date even after cancellation.
   */
  current_period_end: string | null;
  /**
   * ISO timestamp when a free trial ends. Null if no trial is active.
   */
  trial_end: string | null;
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

export type ProfilePatch = Partial<Pick<Profile, "display_name" | "subscription_tier">>;

