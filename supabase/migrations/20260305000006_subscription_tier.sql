-- RoutineNest — Add subscription_tier to profiles
-- Tracks whether the account owner (parent/caregiver) has a free or premium subscription.
-- tier 'free'    → basic routines + AAC (default)
-- tier 'premium' → full study curriculum, advanced learning plans, progress analytics
--
-- NOTE: AAC communication tools are never gated behind a paywall regardless of tier.

alter table public.profiles
  add column if not exists subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'premium'));

comment on column public.profiles.subscription_tier is
  'Subscription tier for this account. free = basic routines + AAC. premium = full study curriculum + analytics.';

create index if not exists idx_profiles_subscription_tier
  on public.profiles(subscription_tier);
