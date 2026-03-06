"use client";

import { cn } from "@/lib/utils";

interface AACCardProps {
  /** Text label shown below the icon */
  label: string;
  /** Material Symbol icon name */
  icon: string;
  /** Border color as a Tailwind border-color class (e.g. "border-kid-teal") */
  borderColor?: string;
  /** Tap handler */
  onTap?: () => void;
  /** Enlarge tile for easier tapping */
  bigButtonMode?: boolean;
  /** Disable motion & hover effects */
  calm?: boolean;
}

/**
 * AAC communication card used on the Talk board.
 * Displays a Material Symbol icon with a colored border and a text label.
 * Designed for touch interaction with a minimum 48px touch target.
 */
export function AACCard({
  label,
  icon,
  borderColor = "border-kid-teal",
  onTap,
  bigButtonMode = false,
  calm = false,
}: AACCardProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      className={cn(
        "min-w-[48px] min-h-[48px] rounded-xl",
        "flex flex-col items-center justify-center gap-2",
        "bg-card cursor-pointer select-none shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        calm ? "" : "transition-transform active:scale-95 hover:shadow-md",
        bigButtonMode
          ? "h-40 border-[6px] px-4 py-5 gap-3"
          : "h-32 border-[4px] px-3 py-4",
        borderColor,
      )}
      aria-label={label}
    >
      <span
        className={cn(
          "material-symbols-outlined leading-none",
          bigButtonMode ? "text-5xl" : "text-4xl",
        )}
        aria-hidden="true"
      >
        {icon}
      </span>

      <span
        className={cn(
          "font-bold leading-tight text-center",
          bigButtonMode ? "text-lg" : "text-base",
        )}
      >
        {label}
      </span>
    </button>
  );
}
