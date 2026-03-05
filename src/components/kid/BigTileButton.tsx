"use client";

import { cn } from "@/lib/utils";

interface BigTileButtonProps {
  /** Text label shown below the icon */
  label: string;
  /** Image URL for the tile icon (falls back to fallbackEmoji) */
  imageUrl?: string | null;
  /** Emoji fallback when no image is provided */
  fallbackEmoji?: string;
  /** Whether this tile is in a "done" / active state */
  active?: boolean;
  /** Short status text shown below the label when active */
  activeLabel?: string;
  /** Disable motion & hover effects (calm mode) */
  calm?: boolean;
  /** Visually pressed / highlighted state (e.g. AAC tap feedback) */
  pressed?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Accessible label (overrides visual label when provided) */
  ariaLabel?: string;
  /** aria-pressed value for toggle-style tiles */
  ariaPressed?: boolean;
}

/**
 * A large, accessible tile button used on kid-facing pages.
 * Min 130px tall, 44px+ wide — designed for touch interaction.
 * Shows an icon (image or emoji) plus a text label.
 */
export function BigTileButton({
  label,
  imageUrl,
  fallbackEmoji = "⭐",
  active = false,
  activeLabel,
  calm = false,
  pressed = false,
  onClick,
  ariaLabel,
  ariaPressed,
}: BigTileButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[130px] min-w-[44px] rounded-2xl border-2 p-4",
        "flex flex-col items-center justify-center gap-3 text-center",
        "cursor-pointer select-none shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        calm ? "" : "transition-transform active:scale-95 hover:shadow-md",
        pressed
          ? "border-primary bg-primary/15 scale-95 shadow-inner"
          : active
            ? "border-success bg-success/10"
            : "border-border bg-card hover:border-primary/60",
      )}
      aria-label={ariaLabel ?? label}
      aria-pressed={ariaPressed}
    >
      {imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageUrl}
          alt=""
          className="h-16 w-16 rounded-xl object-cover"
          aria-hidden="true"
        />
      ) : (
        <span className="text-4xl" role="img" aria-hidden="true">
          {fallbackEmoji}
        </span>
      )}

      <span className="text-base font-bold leading-tight">{label}</span>

      {active && activeLabel && (
        <span className="text-sm font-bold text-success">{activeLabel}</span>
      )}
    </button>
  );
}
