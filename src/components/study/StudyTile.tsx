"use client";

import { cn } from "@/lib/utils";
import { ProgressBar } from "./ProgressBar";

/** Alternating pastel accent classes applied by index. */
const accentColors = [
  "bg-primary/10 border-primary/40",
  "bg-secondary/10 border-secondary/40",
  "bg-success/10 border-success/40",
  "bg-primary/15 border-primary/50",
  "bg-secondary/15 border-secondary/50",
  "bg-success/15 border-success/50",
];

interface StudyTileProps {
  /** Subject title displayed under the icon */
  title: string;
  /** Emoji icon for the subject */
  icon: string;
  /** Optional description shown below the title */
  description?: string;
  /** Current progress 0–100 (omit to hide the bar) */
  progress?: number;
  /** Whether this subject is locked (premium) */
  locked?: boolean;
  /** Index used to pick an alternating accent color */
  index?: number;
  /** Disable motion & hover effects (calm mode) */
  calm?: boolean;
  /**
   * Big-button mode — increases tile height and font size.
   * Coexists with calm mode (calm suppresses animations, big-button enlarges tiles).
   */
  bigButtonMode?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Large, colorful tile for subject areas on the Study Home page.
 * Shows an emoji, title, optional description, and optional progress bar.
 * Locked tiles display a lock overlay with muted appearance.
 */
export function StudyTile({
  title,
  icon,
  description,
  progress,
  locked = false,
  index = 0,
  calm = false,
  bigButtonMode = false,
  onClick,
}: StudyTileProps) {
  const accent = accentColors[index % accentColors.length];

  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={cn(
        "relative min-w-[44px] rounded-2xl border-2 p-4",
        "flex flex-col items-center justify-center gap-2 text-center",
        "cursor-pointer select-none shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        calm ? "" : "transition-transform active:scale-95 hover:shadow-md",
        // big_button_mode increases min height and padding
        bigButtonMode ? "min-h-[170px] px-5 py-6 gap-3" : "min-h-[140px]",
        locked ? "opacity-50 cursor-not-allowed border-border bg-muted" : accent,
      )}
      aria-label={locked ? `${title} (locked)` : title}
    >
      {/* Lock overlay */}
      {locked && (
        <span
          className="absolute right-2 top-2 text-lg"
          aria-hidden="true"
        >
          🔒
        </span>
      )}

      <span
        className={cn(bigButtonMode ? "text-5xl" : "text-4xl")}
        role="img"
        aria-hidden="true"
      >
        {icon}
      </span>

      <span
        className={cn(
          "font-bold leading-tight",
          bigButtonMode ? "text-lg" : "text-base",
        )}
      >
        {title}
      </span>

      {description && (
        <span className="text-sm text-muted-foreground">{description}</span>
      )}

      {progress !== undefined && !locked && (
        <div className="mt-1 w-full px-2">
          <ProgressBar value={progress} size="sm" />
        </div>
      )}
    </button>
  );
}
