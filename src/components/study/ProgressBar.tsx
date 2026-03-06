"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** Current progress value (0–100) */
  value: number;
  /** Optional label displayed above the bar */
  label?: string;
  /** Show the numeric percentage beside the bar */
  showPercent?: boolean;
  /** Bar height variant */
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<ProgressBarProps["size"]>, string> = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

/**
 * Kid-friendly progress bar with rounded ends and optional label.
 * Fully accessible with progressbar role and ARIA attributes.
 */
export function ProgressBar({
  value,
  label,
  showPercent = false,
  size = "md",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="flex w-full flex-col gap-1">
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-sm font-semibold">
          {label && <span>{label}</span>}
          {showPercent && (
            <span className="text-muted-foreground">{clamped}%</span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${clamped}% complete`}
        className={cn(
          "w-full overflow-hidden rounded-full bg-muted",
          sizeClasses[size],
        )}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
