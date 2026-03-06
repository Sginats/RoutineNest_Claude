"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface UpgradeBannerProps {
  /** Custom heading (defaults to generic upgrade message) */
  heading?: string;
  /** Custom description */
  description?: string;
  /** Disable motion effects (calm mode) */
  calm?: boolean;
  /** Extra CSS classes */
  className?: string;
}

/**
 * Inline banner shown when a user tries to access premium-only content.
 * Links to the subscription management page at /parent/subscription.
 *
 * Design principles: calm colours, clear message, large tap target.
 * AAC features are NEVER wrapped with this component — they are always free.
 */
export function UpgradeBanner({
  heading = "Premium Content",
  description = "Upgrade to Premium to unlock the full study curriculum, advanced learning plans, and detailed progress analytics.",
  calm = false,
  className,
}: UpgradeBannerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-3xl border-2 border-primary/30 bg-primary/5 p-6 text-center",
        className,
      )}
      role="region"
      aria-label="Premium feature — upgrade required"
    >
      <span className="text-5xl" role="img" aria-label="Star">
        ⭐
      </span>

      <div className="flex flex-col gap-1">
        <p className="text-xl font-extrabold text-primary">{heading}</p>
        <p className="text-base text-muted-foreground">{description}</p>
      </div>

      {/* AAC note — reassure parents that AAC is always free */}
      <p className="rounded-xl bg-success/10 px-4 py-2 text-sm font-semibold text-success">
        💬 Talk Board (AAC) is always free — no upgrade needed.
      </p>

      <Link
        href="/parent/subscription"
        className={cn(
          "inline-flex min-h-[52px] min-w-[200px] items-center justify-center gap-2",
          "rounded-2xl bg-primary px-6 text-base font-bold text-primary-foreground shadow-md",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          calm ? "" : "transition-transform hover:scale-105 active:scale-95",
        )}
      >
        🔓 Upgrade to Premium
      </Link>
    </div>
  );
}
