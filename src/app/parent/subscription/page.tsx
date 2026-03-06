"use client";

import { useCallback } from "react";
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
import { useSubscription, useUpdateSubscription } from "@/lib/subscriptionHooks";
import type { SubscriptionTier } from "@/lib/types";
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

// ── Tier card ─────────────────────────────────────────────────────────────────

interface TierCardProps {
  tier: SubscriptionTier;
  current: boolean;
  title: string;
  price: string;
  description: string;
  onSelect: () => void;
  loading: boolean;
}

function TierCard({
  tier,
  current,
  title,
  price,
  description,
  onSelect,
  loading,
}: TierCardProps) {
  const isPremium = tier === "premium";

  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 rounded-3xl border-2 p-6",
        isPremium
          ? "border-primary bg-primary/5"
          : "border-border bg-card",
        current && "ring-2 ring-success ring-offset-2",
      )}
    >
      {current && (
        <span className="absolute right-4 top-4 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
          ✅ Current plan
        </span>
      )}

      {isPremium && !current && (
        <span className="absolute right-4 top-4 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          ⭐ Recommended
        </span>
      )}

      <div className="flex flex-col gap-1">
        <p className="text-2xl font-extrabold text-foreground">{title}</p>
        <p className="text-3xl font-extrabold text-primary">{price}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {!current ? (
        <Button
          onClick={onSelect}
          disabled={loading}
          variant={isPremium ? "default" : "outline"}
          className="min-h-[52px] text-base font-bold"
          aria-label={`Switch to ${title} plan`}
        >
          {loading ? "Updating…" : isPremium ? "🔓 Upgrade to Premium" : "Switch to Free"}
        </Button>
      ) : (
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-success/10 px-4 py-3 text-base font-bold text-success">
          ✅ Your current plan
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const queryClient = useQueryClient();

  const { data: tier, isLoading: tierLoading } = useSubscription(user?.id);
  const { mutate: updateTier, isPending } = useUpdateSubscription(user?.id);

  const handleSelect = useCallback(
    (newTier: SubscriptionTier) => {
      if (!user) return;
      updateTier(newTier, {
        onSuccess: () => {
          // Invalidate subscription-dependent queries so pages recheck gating
          queryClient.invalidateQueries({ queryKey: ["subscription"] });
        },
      });
    },
    [user, updateTier, queryClient],
  );

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

  const currentTier = tier ?? "free";

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

        {/* Tier selector */}
        <div className="grid gap-4 sm:grid-cols-2">
          <TierCard
            tier="free"
            current={currentTier === "free"}
            title="Free"
            price="£0 / month"
            description="Core routines + AAC communication tools — always available."
            onSelect={() => handleSelect("free")}
            loading={isPending}
          />
          <TierCard
            tier="premium"
            current={currentTier === "premium"}
            title="Premium"
            price="£4.99 / month"
            description="Full study curriculum, advanced learning plans, and detailed progress analytics."
            onSelect={() => handleSelect("premium")}
            loading={isPending}
          />
        </div>

        {/* Payment note */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
            <CardDescription>
              Secure payment processing coming soon. Select &quot;Upgrade to Premium&quot; above
              to be notified when billing is available, or contact us to arrange early access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              📧{" "}
              <a
                href="mailto:hello@routinenest.app"
                className="text-primary underline-offset-4 hover:underline"
              >
                hello@routinenest.app
              </a>
            </p>
          </CardContent>
        </Card>

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
                  <th className="py-2 text-center font-semibold text-primary">Premium</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f) => (
                  <tr key={f.label} className="border-b border-border/50 last:border-0">
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
                        <span className="text-success" aria-label="Included">✅</span>
                      ) : (
                        <span className="text-muted-foreground" aria-label="Not included">—</span>
                      )}
                    </td>
                    <td className="py-2 text-center text-base">
                      {f.premium ? (
                        <span className="text-success" aria-label="Included">✅</span>
                      ) : (
                        <span className="text-muted-foreground" aria-label="Not included">—</span>
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
          <span className="text-2xl" role="img" aria-label="Speech bubble">💬</span>
          <div>
            <p className="font-bold text-success">AAC is always free</p>
            <p className="text-sm text-muted-foreground">
              The Talk Board and all AAC communication tools are{" "}
              <strong>permanently free</strong> — regardless of your subscription plan.
              Communication support must be accessible to every child.
            </p>
          </div>
        </div>
      </div>
    </ParentGate>
  );
}
