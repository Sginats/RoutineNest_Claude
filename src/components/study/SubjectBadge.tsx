"use client";

import { cn } from "@/lib/utils";

interface SubjectBadgeProps {
  /** Subject display text */
  title: string;
  /** Emoji icon for the subject */
  icon: string;
  /** Whether this badge is currently selected */
  selected?: boolean;
  /** Click handler (omit for non-interactive badge) */
  onClick?: () => void;
}

/**
 * Compact pill-shaped badge for displaying or filtering a subject area.
 * Toggles between selected (primary) and unselected (muted) appearance.
 */
export function SubjectBadge({
  title,
  icon,
  selected = false,
  onClick,
}: SubjectBadgeProps) {
  const Tag = onClick ? "button" : "span";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
        "text-sm font-semibold select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        onClick && "cursor-pointer",
        selected
          ? "bg-primary text-primary-foreground font-bold"
          : "bg-muted text-muted-foreground",
      )}
      aria-pressed={onClick ? selected : undefined}
      aria-label={`${title}${selected ? " (selected)" : ""}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{title}</span>
    </Tag>
  );
}
