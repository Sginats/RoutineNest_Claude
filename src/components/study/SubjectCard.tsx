"use client";

import { cn } from "@/lib/utils";
import { ProgressRing } from "@/components/kid/ProgressRing";

interface SubjectCardProps {
  /** Subject title */
  title: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Material Symbol icon name */
  icon: string;
  /** Background color class for the icon circle (e.g. "bg-kid-teal") */
  iconBg?: string;
  /** Progress percentage 0–100 */
  progress?: number;
  /** Start learning handler */
  onStart?: () => void;
  /** Enlarge for easier tapping */
  bigButtonMode?: boolean;
}

/**
 * Study subject card with a circular SVG progress ring.
 * Shows an icon, title, subtitle, progress indicator, and a start button.
 * Uses the shared ProgressRing component for visual consistency.
 */
export function SubjectCard({
  title,
  subtitle,
  icon,
  iconBg = "bg-primary/15",
  progress = 0,
  onStart,
  bigButtonMode = false,
}: SubjectCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-card shadow-sm",
        bigButtonMode ? "p-5" : "p-4",
      )}
    >
      {/* Top row: icon + text + progress ring */}
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl",
            bigButtonMode ? "h-14 w-14" : "h-12 w-12",
            iconBg,
          )}
        >
          <span
            className={cn(
              "material-symbols-outlined text-foreground",
              bigButtonMode ? "text-3xl" : "text-2xl",
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        </div>

        {/* Title & subtitle */}
        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className={cn(
              "font-bold leading-tight",
              bigButtonMode ? "text-lg" : "text-base",
            )}
          >
            {title}
          </span>
          {subtitle && (
            <span className="text-sm text-muted-foreground">{subtitle}</span>
          )}
        </div>

        {/* Circular progress ring */}
        <ProgressRing value={progress} size={48} strokeWidth={5} showPercent={false} />
      </div>

      {/* Start button */}
      {onStart && (
        <button
          type="button"
          onClick={onStart}
          className={cn(
            "w-full rounded-xl bg-primary py-3",
            "text-center font-bold text-primary-foreground shadow-sm",
            "min-h-[48px] cursor-pointer select-none",
            "transition-transform active:scale-95 hover:shadow-md",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            bigButtonMode ? "py-4 text-lg" : "py-3 text-base",
          )}
        >
          Start Learning
        </button>
      )}
    </div>
  );
}
