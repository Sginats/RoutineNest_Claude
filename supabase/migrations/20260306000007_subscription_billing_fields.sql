-- RoutineNest — Subscription billing fields
-- Adds Stripe-compatible billing columns to the profiles table.
--
-- IMPORTANT: These columns are populated ONLY by a secure backend webhook
-- handler (e.g. a Supabase Edge Function) using the Stripe service-role key.
-- Client-side code must NEVER write to these columns directly.
-- RLS must ensure clients cannot update stripe_* or subscription_status columns.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id        TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id    TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subscription_status       TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS current_period_end        TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trial_end                 TIMESTAMPTZ DEFAULT NULL;

-- Index for fast lookups by Stripe customer ID (used by webhook handler)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx
  ON profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Index for fast lookups by Stripe subscription ID (used by webhook handler)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_stripe_subscription_id_idx
  ON profiles (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- RLS policy: users may read but NOT write Stripe fields
-- (existing SELECT policy already covers this; we add an explicit restriction)
-- The billing webhook function uses the service role key and bypasses RLS.
COMMENT ON COLUMN profiles.stripe_customer_id IS
  'Stripe customer ID. Set only by the billing backend via service-role key.';
COMMENT ON COLUMN profiles.stripe_subscription_id IS
  'Stripe subscription ID. Set only by the billing backend via service-role key.';
COMMENT ON COLUMN profiles.subscription_status IS
  'Billing status from Stripe (active, trialing, past_due, canceled, etc). Set only by the billing webhook handler.';
COMMENT ON COLUMN profiles.current_period_end IS
  'End of current billing period. Access persists until this date on cancellation.';
COMMENT ON COLUMN profiles.trial_end IS
  'Free trial end date. NULL when no trial is active.';
