"use client";

import { cn } from "@/lib/utils";

interface LessonCardProps {
  /** Lesson title */
  title: string;
  /** Emoji icon for the lesson */
  icon: string;
  /** Short lesson description */
  description?: string;
  /** Estimated duration in minutes */
  duration_minutes?: number;
  /** Star reward points for completing the lesson */
  reward_points?: number;
  /** Whether the lesson has been completed */
  completed?: boolean;
  /** Whether the lesson is locked */
  locked?: boolean;
  /** Disable motion & hover effects (calm mode) */
  calm?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Horizontal card for an individual lesson in a module view.
 * Displays icon, title, duration, reward stars, and completion / locked state.
 */
export function LessonCard({
  title,
  icon,
  description,
  duration_minutes,
  reward_points,
  completed = false,
  locked = false,
  calm = false,
  onClick,
}: LessonCardProps) {
  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border-2 p-4",
        "min-h-[72px] min-w-[44px] text-left",
        "cursor-pointer select-none shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        calm ? "" : "transition-transform active:scale-[0.98] hover:shadow-md",
        completed
          ? "border-success bg-success/10"
          : locked
            ? "opacity-50 cursor-not-allowed border-border bg-muted"
            : "border-border bg-card hover:border-primary/60",
      )}
      aria-label={
        locked
          ? `${title} (locked)`
          : completed
            ? `${title} (completed)`
            : title
      }
    >
      {/* Icon */}
      <span className="shrink-0 text-3xl" role="img" aria-hidden="true">
        {locked ? "🔒" : icon}
      </span>

      {/* Text content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-base font-bold leading-tight">{title}</span>

        {description && (
          <span className="truncate text-sm text-muted-foreground">
            {description}
          </span>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {duration_minutes !== undefined && (
            <span>{duration_minutes} min</span>
          )}
          {reward_points !== undefined && (
            <span aria-label={`${reward_points} reward stars`}>
              ⭐ {reward_points}
            </span>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className="shrink-0 text-xl" aria-hidden="true">
        {completed && <span className="text-success">✅</span>}
      </div>
    </button>
  );
}
