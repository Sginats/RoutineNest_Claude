/**
 * RoutineNest — Billing abstraction layer
 *
 * ARCHITECTURE NOTE
 * =================
 * RoutineNest is a static-export Next.js app (output: "export").
 * There is NO server runtime in the static app.
 *
 * Stripe requires a secure server-side secret key for:
 *   - Creating Checkout Sessions (stripe.checkout.sessions.create)
 *   - Managing the Customer Portal (stripe.billingPortal.sessions.create)
 *   - Verifying webhook signatures (stripe.webhooks.constructEvent)
 *
 * NONE of these can be done safely in client-side code.
 *
 * DEPLOYMENT REQUIREMENT
 * ======================
 * To enable real Stripe billing you must deploy a separate secure backend
 * that handles these operations. Suitable options include:
 *
 *   1. Supabase Edge Functions (recommended — already used for DB)
 *      https://supabase.com/docs/guides/functions
 *
 *   2. A separate serverless function (Vercel Functions, Netlify Functions,
 *      AWS Lambda, Cloudflare Workers, etc.)
 *
 *   3. A lightweight Node.js / Express microservice
 *
 * The backend must:
 *   - Hold STRIPE_SECRET_KEY as a server-side env var (never exposed to the browser)
 *   - Expose endpoints for createCheckoutSession, openCustomerPortal
 *   - Listen for Stripe webhooks and verify signatures
 *   - On successful payment, update profiles.subscription_status and related fields
 *     in Supabase using the service-role key
 *
 * This file provides:
 *   - Type definitions for subscription billing state
 *   - Typed interface stubs for future backend calls
 *   - A helper to read billing state from the user's profile
 *
 * When you deploy the secure backend, replace the stub implementations with
 * real fetch() calls to your backend URL (stored as NEXT_PUBLIC_BILLING_URL).
 */

// ---------------------------------------------------------------------------
// Billing state types
// ---------------------------------------------------------------------------

/**
 * The full set of billing states a subscription can be in.
 * These mirror Stripe subscription statuses plus our own free/trial states.
 */
export type BillingStatus =
  | "free"            // Not subscribed — using the free plan
  | "trialing"        // In a free trial period
  | "active"          // Premium subscription is active and paid
  | "past_due"        // Payment failed; grace period, access may still be granted
  | "canceled"        // Subscription was canceled (still active until period end)
  | "incomplete"      // First payment attempt failed (very new subscription)
  | "unpaid";         // Multiple payment failures; access should be revoked

/**
 * Extended billing data to be stored alongside the profile.
 * These fields are populated by the backend webhook handler on payment events.
 */
export interface BillingState {
  /** Stripe customer ID — set when user first initiates checkout */
  stripe_customer_id: string | null;
  /** Stripe subscription ID — set after first successful payment */
  stripe_subscription_id: string | null;
  /** Current billing status */
  status: BillingStatus;
  /** ISO timestamp when the current billing period ends */
  current_period_end: string | null;
  /** ISO timestamp when a free trial ends (null if no trial) */
  trial_end: string | null;
}

/**
 * Returns true if the billing status grants premium access.
 * Grace periods (past_due, canceled within period) still grant access.
 */
export function billingStatusGrantsPremium(status: BillingStatus): boolean {
  return status === "active" || status === "trialing" || status === "past_due" || status === "canceled";
}

/**
 * Human-readable label for each billing status, shown in the parent UI.
 */
export const BILLING_STATUS_LABELS: Record<BillingStatus, string> = {
  free: "Free plan",
  trialing: "Free trial active",
  active: "Premium — active",
  past_due: "Premium — payment due",
  canceled: "Premium — cancels at period end",
  incomplete: "Premium — payment incomplete",
  unpaid: "Premium — unpaid",
};

// ---------------------------------------------------------------------------
// Billing action stubs
// (Replace with real fetch calls once a secure backend is deployed)
// ---------------------------------------------------------------------------

/**
 * The base URL for the billing backend.
 * Set NEXT_PUBLIC_BILLING_URL in your environment to point at your backend.
 * Example: https://your-project.supabase.co/functions/v1/billing
 */
const BILLING_URL = process.env.NEXT_PUBLIC_BILLING_URL ?? null;

export interface CheckoutSessionResult {
  /** The Stripe-hosted Checkout URL to redirect the user to */
  url: string;
}

export interface CustomerPortalResult {
  /** The Stripe-hosted Customer Portal URL to redirect the user to */
  url: string;
}

/**
 * Create a Stripe Checkout Session to start a new subscription.
 *
 * @param userId - The Supabase auth user ID (used to link the Stripe customer)
 * @param returnUrl - URL to return to after checkout completes/is cancelled
 *
 * STUB: throws a clear error until a backend URL is configured.
 * When NEXT_PUBLIC_BILLING_URL is set, calls POST /create-checkout-session.
 */
export async function createCheckoutSession(
  userId: string,
  returnUrl: string,
): Promise<CheckoutSessionResult> {
  if (!BILLING_URL) {
    throw new BillingNotConfiguredError(
      "Billing backend is not configured. " +
      "Set NEXT_PUBLIC_BILLING_URL to enable Stripe payments.",
    );
  }

  const res = await fetch(`${BILLING_URL}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, returnUrl }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`Checkout session creation failed: ${text}`);
  }

  return res.json() as Promise<CheckoutSessionResult>;
}

/**
 * Open the Stripe Customer Portal so the user can manage their subscription.
 *
 * @param userId - The Supabase auth user ID
 * @param returnUrl - URL to return to when the user exits the portal
 *
 * STUB: throws a clear error until a backend URL is configured.
 * When NEXT_PUBLIC_BILLING_URL is set, calls POST /customer-portal.
 */
export async function openCustomerPortal(
  userId: string,
  returnUrl: string,
): Promise<CustomerPortalResult> {
  if (!BILLING_URL) {
    throw new BillingNotConfiguredError(
      "Billing backend is not configured. " +
      "Set NEXT_PUBLIC_BILLING_URL to enable the customer portal.",
    );
  }

  const res = await fetch(`${BILLING_URL}/customer-portal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, returnUrl }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`Customer portal creation failed: ${text}`);
  }

  return res.json() as Promise<CustomerPortalResult>;
}

/**
 * Sync the subscription state from the backend into the local profile.
 * Call this after returning from Stripe Checkout to refresh billing status.
 *
 * STUB: no-op until a backend URL is configured.
 */
export async function syncSubscriptionState(userId: string): Promise<void> {
  if (!BILLING_URL) {
    // No backend to sync from — silently no-op
    return;
  }

  const res = await fetch(`${BILLING_URL}/sync-subscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    console.warn("[billing] syncSubscriptionState failed:", await res.text().catch(() => ""));
  }
}

/**
 * Returns true if a billing backend URL is configured.
 * Use this to conditionally show "Coming soon" vs real checkout buttons.
 */
export function isBillingConfigured(): boolean {
  return BILLING_URL !== null;
}

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export class BillingNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BillingNotConfiguredError";
  }
}
