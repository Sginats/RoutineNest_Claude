"use client";

import { cn } from "@/lib/utils";

interface BreakCardProps {
  /** Callback triggered when the child taps the break card */
  onTakeBreak?: () => void;
  /** Disable motion & hover effects (calm mode) */
  calm?: boolean;
}

/**
 * Calming break-time card shown within study plans.
 * Big tappable area with an encouraging message and gentle styling.
 */
export function BreakCard({ onTakeBreak, calm = false }: BreakCardProps) {
  return (
    <button
      type="button"
      onClick={onTakeBreak}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 p-6",
        "min-h-[120px] min-w-[44px] text-center",
        "cursor-pointer select-none shadow-sm",
        "border-secondary/40 bg-secondary/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        calm ? "" : "transition-transform active:scale-95 hover:shadow-md",
      )}
      aria-label="Take a break"
    >
      <span className="text-4xl" role="img" aria-hidden="true">
        🌿
      </span>

      <span className="text-lg font-bold">Take a Break</span>

      <span className="text-sm text-muted-foreground">
        You&apos;re doing great — rest for a moment! 🧘
      </span>
    </button>
  );
}
