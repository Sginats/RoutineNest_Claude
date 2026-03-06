"use client";

import { cn } from "@/lib/utils";

interface RewardStarsProps {
  /** Number of stars earned */
  earned: number;
  /** Total possible stars */
  total: number;
  /** Star display size */
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<RewardStarsProps["size"]>, string> = {
  sm: "text-base gap-0.5",
  md: "text-xl gap-1",
  lg: "text-3xl gap-1.5",
};

/**
 * Row of star indicators — filled ⭐ for earned, empty ☆ for remaining.
 * Includes an accessible label describing the count.
 */
export function RewardStars({
  earned,
  total,
  size = "md",
}: RewardStarsProps) {
  const clampedEarned = Math.min(Math.max(0, earned), total);

  return (
    <div
      className={cn("flex items-center", sizeClasses[size])}
      role="img"
      aria-label={`${clampedEarned} of ${total} stars earned`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} aria-hidden="true">
          {i < clampedEarned ? "⭐" : "☆"}
        </span>
      ))}
    </div>
  );
}
