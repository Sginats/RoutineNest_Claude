"use client";

import { cn } from "@/lib/utils";

interface RewardBadgeProps {
  /** Badge identifier */
  id: string;
  /** Material Symbol icon name */
  icon: string;
  /** Badge display name */
  label: string;
  /** Whether the badge has been earned */
  earned?: boolean;
  /** Colour variant */
  color?: "amber" | "purple" | "blue" | "orange" | "green" | "red" | "indigo" | "teal";
  /** Badge size variant */
  size?: "sm" | "md" | "lg";
  /** Disable animations (calm mode) */
  calm?: boolean;
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  amber:  { bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-300 dark:border-amber-700", text: "text-amber-500", glow: "shadow-amber-200/50" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-300 dark:border-purple-700", text: "text-purple-500", glow: "shadow-purple-200/50" },
  blue:   { bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-300 dark:border-blue-700", text: "text-blue-500", glow: "shadow-blue-200/50" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/30", border: "border-orange-300 dark:border-orange-700", text: "text-orange-500", glow: "shadow-orange-200/50" },
  green:  { bg: "bg-green-100 dark:bg-green-900/30", border: "border-green-300 dark:border-green-700", text: "text-green-500", glow: "shadow-green-200/50" },
  red:    { bg: "bg-red-100 dark:bg-red-900/30", border: "border-red-300 dark:border-red-700", text: "text-red-500", glow: "shadow-red-200/50" },
  indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/30", border: "border-indigo-300 dark:border-indigo-700", text: "text-indigo-500", glow: "shadow-indigo-200/50" },
  teal:   { bg: "bg-teal-100 dark:bg-teal-900/30", border: "border-teal-300 dark:border-teal-700", text: "text-teal-500", glow: "shadow-teal-200/50" },
};

const SIZE_MAP = {
  sm: { circle: "size-14", icon: "text-2xl", label: "text-[10px]" },
  md: { circle: "size-20", icon: "text-4xl", label: "text-xs" },
  lg: { circle: "size-24", icon: "text-5xl", label: "text-sm" },
};

/**
 * Reward badge component used on the rewards page.
 * Displays a circular badge with an icon and label.
 * Locked badges are dimmed with a lock icon.
 * Earned badges have a coloured glow and filled icon.
 */
export function RewardBadge({
  id,
  icon,
  label,
  earned = false,
  color = "amber",
  size = "md",
  calm = false,
}: RewardBadgeProps) {
  const palette = COLOR_MAP[color] ?? COLOR_MAP.amber;
  const sizeStyles = SIZE_MAP[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 min-w-[80px]",
        !earned && "opacity-40",
      )}
      aria-label={earned ? `${label} badge earned` : `${label} badge locked`}
    >
      <div
        className={cn(
          "rounded-full flex items-center justify-center border-4 shadow-sm",
          sizeStyles.circle,
          earned
            ? `${palette.bg} ${palette.border} ${!calm ? palette.glow : ""}`
            : "bg-muted dark:bg-muted/30 border-border",
          earned && !calm && "transition-transform hover:scale-110",
        )}
      >
        <span
          className={cn(
            "material-symbols-outlined",
            sizeStyles.icon,
            earned ? palette.text : "text-muted-foreground",
          )}
          style={earned ? { fontVariationSettings: "'FILL' 1" } : undefined}
          aria-hidden="true"
        >
          {earned ? icon : "lock"}
        </span>
      </div>
      <p className={cn("font-extrabold text-center leading-tight", sizeStyles.label)}>
        {earned ? label : "???"}
      </p>
    </div>
  );
}
