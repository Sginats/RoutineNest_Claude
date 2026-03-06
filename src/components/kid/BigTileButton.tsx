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
  /**
   * Big-button mode — increases minimum tile size, spacing, and label size
   * for easier tapping.  Overrides the default 130px min-height with a
   * larger value and uses a bigger font.
   *
   * Precedence rule: when both big_button_mode and a custom grid_size are set,
   * big_button_mode always enlarges individual tiles regardless of grid
   * density.  The grid itself is responsible for choosing the column count.
   */
  bigButtonMode?: boolean;
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
 *
 * When bigButtonMode is true: min-height grows to 160px, emoji is larger,
 * and the label text is bigger to improve legibility and tap accuracy.
 */
export function BigTileButton({
  label,
  imageUrl,
  fallbackEmoji = "⭐",
  active = false,
  activeLabel,
  calm = false,
  bigButtonMode = false,
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
        "min-w-[44px] rounded-2xl border-2 p-4",
        "flex flex-col items-center justify-center gap-3 text-center",
        "cursor-pointer select-none shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        calm ? "" : "transition-transform active:scale-95 hover:shadow-md",
        // Big-button mode increases minimum height and padding for easier tapping
        bigButtonMode ? "min-h-[160px] px-5 py-6 gap-4" : "min-h-[130px]",
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
          className={cn(
            "rounded-xl object-cover",
            bigButtonMode ? "h-20 w-20" : "h-16 w-16",
          )}
          aria-hidden="true"
        />
      ) : (
        <span
          className={cn(
            "leading-none",
            bigButtonMode ? "text-5xl" : "text-4xl",
          )}
          role="img"
          aria-hidden="true"
        >
          {fallbackEmoji}
        </span>
      )}

      <span
        className={cn(
          "font-bold leading-tight",
          bigButtonMode ? "text-lg" : "text-base",
        )}
      >
        {label}
      </span>

      {active && activeLabel && (
        <span
          className={cn(
            "font-bold text-success",
            bigButtonMode ? "text-base" : "text-sm",
          )}
        >
          {activeLabel}
        </span>
      )}
    </button>
  );
}
