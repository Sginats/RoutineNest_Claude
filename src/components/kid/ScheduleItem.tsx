"use client";

import { cn } from "@/lib/utils";

interface ScheduleItemProps {
  /** Task title */
  title: string;
  /** Optional time label (e.g. "9:00 AM") */
  time?: string;
  /** Material Symbol icon name */
  icon: string;
  /** Whether the task is completed */
  completed?: boolean;
  /** Whether this is the current task */
  current?: boolean;
  /** Enlarge for easier tapping */
  bigButtonMode?: boolean;
  /** Disable motion & hover effects */
  calm?: boolean;
  /** Toggle completion handler */
  onToggle?: () => void;
}

/**
 * Schedule task card for the daily visual schedule.
 * Displays an icon, title, optional time, and a round completion toggle.
 * Current tasks are highlighted; completed tasks are dimmed with strikethrough.
 */
export function ScheduleItem({
  title,
  time,
  icon,
  completed = false,
  current = false,
  bigButtonMode = false,
  calm = false,
  onToggle,
}: ScheduleItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl bg-card p-3",
        "shadow-sm",
        calm ? "" : "transition-all",
        bigButtonMode ? "p-4 gap-4" : "",
        current && "border-2 border-primary shadow-lg",
        !current && "border border-border",
        completed && "opacity-60",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-primary/10",
          bigButtonMode ? "h-14 w-14" : "h-12 w-12",
        )}
      >
        <span
          className={cn(
            "material-symbols-outlined text-primary",
            bigButtonMode ? "text-3xl" : "text-2xl",
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>

      {/* Title & time */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "font-bold leading-tight",
            bigButtonMode ? "text-lg" : "text-base",
            completed && "line-through",
          )}
        >
          {title}
        </span>
        {time && (
          <span
            className={cn(
              "text-muted-foreground",
              bigButtonMode ? "text-base" : "text-sm",
            )}
          >
            {time}
          </span>
        )}
      </div>

      {/* Completion toggle */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border-2",
          "cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          calm ? "" : "transition-colors",
          bigButtonMode ? "h-12 w-12" : "h-10 w-10",
          completed
            ? "border-success bg-success text-white"
            : "border-border bg-background hover:border-primary",
        )}
        aria-label={completed ? `Mark ${title} incomplete` : `Mark ${title} complete`}
        aria-pressed={completed}
      >
        {completed && (
          <span
            className={cn(
              "material-symbols-outlined",
              bigButtonMode ? "text-2xl" : "text-xl",
            )}
            aria-hidden="true"
          >
            check
          </span>
        )}
      </button>
    </div>
  );
}
