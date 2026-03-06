"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRequireAuth } from "@/hooks/useAuth";
import ParentGate from "@/components/ParentGate";
import { useSubscription } from "@/lib/subscriptionHooks";
import {
  isBillingConfigured,
  createCheckoutSession,
  openCustomerPortal,
  BillingNotConfiguredError,
  BILLING_STATUS_LABELS,
  type BillingStatus,
} from "@/lib/billing";
import { cn } from "@/lib/utils";

// ── Feature comparison table ──────────────────────────────────────────────────

const FEATURES: { label: string; free: boolean; premium: boolean; note?: string }[] = [
  { label: "Visual daily schedule", free: true, premium: true },
  { label: "AAC Talk Board (tap-to-speak)", free: true, premium: true, note: "Always free — never locked" },
  { label: "Star rewards", free: true, premium: true },
  { label: "Basic routines", free: true, premium: true },
  { label: "Custom cards & icons", free: true, premium: true },
  { label: "Calm mode & accessibility settings", free: true, premium: true },
  { label: "Offline mode", free: true, premium: true },
  { label: "Full study curriculum (all subjects)", free: false, premium: true },
  { label: "Advanced learning plans", free: false, premium: true },
  { label: "Weekly study planner", free: false, premium: true },
  { label: "Detailed progress analytics", free: false, premium: true },
  { label: "All premium subjects & modules", free: false, premium: true },
];

// ── Billing status badge ──────────────────────────────────────────────────────

function BillingStatusBadge({ status }: { status: BillingStatus }) {
  const label = BILLING_STATUS_LABELS[status];
  const colorClass =
    status === "active" || status === "trialing"
      ? "bg-success/10 text-success border-success/30"
      : status === "past_due" || status === "canceled"
      ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200"
      : status === "unpaid" || status === "incomplete"
      ? "bg-destructive/10 text-destructive border-destructive/30"
      : "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold",
        colorClass,
      )}
    >
      {status === "active" && "✅ "}
      {status === "trialing" && "🎁 "}
      {status === "past_due" && "⚠️ "}
      {status === "canceled" && "🔚 "}
      {status === "free" && "🆓 "}
      {label}
    </span>
  );
}

// ── Current plan panel ────────────────────────────────────────────────────────

function CurrentPlanPanel({
  billingStatus,
  isPremium,
  periodEnd,
  trialEnd,
}: {
  billingStatus: BillingStatus;
  isPremium: boolean;
  periodEnd: string | null;
  trialEnd: string | null;
}) {
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Your current plan</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xl font-extrabold text-foreground">
            {isPremium ? "⭐ Premium" : "🆓 Free"}
          </span>
          <BillingStatusBadge status={billingStatus} />
        </div>

        {billingStatus === "trialing" && trialEnd && (
          <p className="text-sm text-muted-foreground">
            🎁 Trial ends{" "}
            <strong>{new Date(trialEnd).toLocaleDateString()}</strong>
          </p>
        )}

        {(billingStatus === "canceled" || billingStatus === "past_due") &&
          periodEnd && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              ⚠️ Premium access continues until{" "}
              <strong>{new Date(periodEnd).toLocaleDateString()}</strong>
            </p>
          )}

        {billingStatus === "past_due" && (
          <p className="text-sm text-destructive">
            A recent payment failed. Please update your payment method to keep
            your Premium access.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const queryClient = useQueryClient();
  const billingConfigured = isBillingConfigured();

  const { data: tier, isLoading: tierLoading } = useSubscription(user?.id);

  const isPremium = tier === "premium";

  // Billing state — in production these come from profile fields populated by
  // Stripe webhooks.  Until the billing backend is wired up, we derive a
  // reasonable status from the DB tier column (used as a manual dev fallback).
  const billingStatus: BillingStatus = isPremium ? "active" : "free";
  // TODO(stripe-integration): When real Stripe integration is live, replace
  // the hardcoded derivation above by reading from the profile row:
  //   billingStatus = (profile.subscription_status as BillingStatus) ?? "free"
  //   periodEnd = profile.current_period_end
  //   trialEnd = profile.trial_end
  // The profile fields are populated by the webhook handler in billing.ts.

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  const handleUpgrade = useCallback(async () => {
    if (!user) return;
    setBillingError(null);
    setCheckoutLoading(true);
    try {
      const result = await createCheckoutSession(
        user.id,
        window.location.href,
      );
      // Redirect to Stripe Checkout
      window.location.href = result.url;
    } catch (err) {
      if (err instanceof BillingNotConfiguredError) {
        setBillingError(
          "Online payment is not yet enabled for this deployment. " +
          "Contact us at hello@routinenest.app to arrange access.",
        );
      } else {
        setBillingError("Something went wrong starting checkout. Please try again.");
      }
    } finally {
      setCheckoutLoading(false);
    }
  }, [user]);

  const handleManageBilling = useCallback(async () => {
    if (!user) return;
    setBillingError(null);
    setPortalLoading(true);
    try {
      const result = await openCustomerPortal(user.id, window.location.href);
      window.location.href = result.url;
    } catch (err) {
      if (err instanceof BillingNotConfiguredError) {
        setBillingError(
          "The billing portal is not yet enabled for this deployment. " +
          "Contact us at hello@routinenest.app.",
        );
      } else {
        setBillingError("Something went wrong opening the billing portal. Please try again.");
      }
    } finally {
      setPortalLoading(false);
    }
  }, [user]);

  // Invalidate subscription queries (used after returning from Stripe)
  const handleSyncSubscription = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["subscription"] });
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
  }, [queryClient]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (tierLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading subscription…</p>
      </div>
    );
  }

  return (
    <ParentGate>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <Link
            href="/parent"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-primary">
            ⭐ Subscription
          </h1>
          <p className="text-muted-foreground">
            Manage your RoutineNest subscription plan.
          </p>
        </div>

        {/* Current plan */}
        <CurrentPlanPanel
          billingStatus={billingStatus}
          isPremium={isPremium}
          periodEnd={null}
          trialEnd={null}
        />

        {/* Billing error */}
        {billingError && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            ⚠️ {billingError}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {!isPremium && billingConfigured && (
            <Button
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="min-h-[52px] text-base font-bold"
            >
              {checkoutLoading
                ? "Opening checkout…"
                : "🔓 Upgrade to Premium — £4.99/month"}
            </Button>
          )}

          {!isPremium && !billingConfigured && (
            <Button
              variant="outline"
              disabled
              className="min-h-[52px] text-base font-bold cursor-not-allowed opacity-60"
              aria-label="Payments coming soon"
            >
              🔓 Upgrade to Premium — Coming Soon
            </Button>
          )}

          {isPremium && billingConfigured && (
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="min-h-[52px] text-base font-bold"
            >
              {portalLoading ? "Opening portal…" : "⚙️ Manage billing"}
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={handleSyncSubscription}
            className="min-h-[52px] text-sm font-medium text-muted-foreground"
            aria-label="Refresh subscription status"
          >
            🔄 Refresh status
          </Button>
        </div>

        {/* Infrastructure notice when billing is not yet configured */}
        {!billingConfigured && (
          <Card className="border-amber-300/60 bg-amber-50/60 dark:bg-amber-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-amber-800 dark:text-amber-300">
                🔧 Payment backend not yet connected
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-700 dark:text-amber-400">
              <p className="mb-2">
                RoutineNest is a static web app. Stripe payments require a
                secure server-side backend to process transactions and verify
                webhook signatures — this cannot be done safely in a browser.
              </p>
              <p className="mb-2">
                To enable real payments, deploy a billing backend (e.g. a
                Supabase Edge Function) and set{" "}
                <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">
                  NEXT_PUBLIC_BILLING_URL
                </code>{" "}
                in your environment.
              </p>
              <p>
                In the meantime, contact us to arrange early access:&nbsp;
                <a
                  href="mailto:hello@routinenest.app"
                  className="font-semibold underline"
                >
                  hello@routinenest.app
                </a>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Feature comparison */}
        <Card>
          <CardHeader>
            <CardTitle>What&apos;s included</CardTitle>
            <CardDescription>
              A full comparison of Free and Premium features.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-semibold">Feature</th>
                  <th className="py-2 text-center font-semibold">Free</th>
                  <th className="py-2 text-center font-semibold text-primary">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f) => (
                  <tr
                    key={f.label}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-2 pr-4">
                      <span>{f.label}</span>
                      {f.note && (
                        <span className="ml-2 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                          {f.note}
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-center text-base">
                      {f.free ? (
                        <span className="text-success" aria-label="Included">
                          ✅
                        </span>
                      ) : (
                        <span
                          className="text-muted-foreground"
                          aria-label="Not included"
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-center text-base">
                      {f.premium ? (
                        <span className="text-success" aria-label="Included">
                          ✅
                        </span>
                      ) : (
                        <span
                          className="text-muted-foreground"
                          aria-label="Not included"
                        >
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* AAC reassurance */}
        <div className="flex items-start gap-3 rounded-2xl border border-success/40 bg-success/5 p-4">
          <span className="text-2xl" role="img" aria-label="Speech bubble">
            💬
          </span>
          <div>
            <p className="font-bold text-success">AAC is always free</p>
            <p className="text-sm text-muted-foreground">
              The Talk Board and all AAC communication tools are{" "}
              <strong>permanently free</strong> — regardless of your
              subscription plan. Communication support must be accessible to
              every child.
            </p>
          </div>
        </div>

        {/* Developer note — dev mode only */}
        {process.env.NODE_ENV === "development" && (
          <Card className="border-dashed border-muted-foreground/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
                🛠 Dev mode — manual tier override
              </CardTitle>
              <CardDescription className="text-xs">
                This section is only visible in development. In production,
                tier changes happen through Stripe webhooks only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-xs text-muted-foreground">
                Current tier in DB:{" "}
                <code className="font-mono font-bold">{tier ?? "free"}</code>
              </p>
              <p className="text-xs text-muted-foreground">
                To test premium gating, update{" "}
                <code className="font-mono">profiles.subscription_tier</code>{" "}
                directly in Supabase Studio, or implement a dev helper in your
                Edge Function.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ParentGate>
  );
}
