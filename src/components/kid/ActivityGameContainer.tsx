"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ActivityGameContainerProps {
  /** Activity title shown in the header */
  title: string;
  /** Optional step indicator (e.g. "2 / 5") */
  stepLabel?: string;
  /** Progress value 0–100 */
  progress?: number;
  /** Disable motion effects (calm mode) */
  calm?: boolean;
  /** Content of the activity */
  children: ReactNode;
}

/**
 * Wrapper for interactive activity gameplay screens.
 * Provides a consistent header with title, step indicator, and progress bar.
 * Used in TapCorrect, VisualMatching, Sequencing, ListenChoose, and SpeakTapAac activities.
 */
export function ActivityGameContainer({
  title,
  stepLabel,
  progress,
  calm = false,
  children,
}: ActivityGameContainerProps) {
  const clampedProgress = progress !== undefined ? Math.min(100, Math.max(0, progress)) : undefined;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-foreground leading-tight">
          {title}
        </h2>
        {stepLabel && (
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
            {stepLabel}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {clampedProgress !== undefined && (
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Activity progress: ${clampedProgress}%`}
        >
          <div
            className={cn(
              "h-full rounded-full bg-primary",
              calm ? "" : "transition-all duration-300",
            )}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      )}

      {/* Activity content */}
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}
