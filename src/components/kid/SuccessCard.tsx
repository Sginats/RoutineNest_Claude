"use client";

import { cn } from "@/lib/utils";

interface SuccessCardProps {
  /** Number of stars earned (0–3) */
  starsEarned?: number;
  /** Navigate to the next activity */
  onNext?: () => void;
  /** Navigate home */
  onHome?: () => void;
  /** Retry the current activity */
  onRetry?: () => void;
}

/**
 * Activity completion success screen.
 * Shows a celebratory "Great Job!" heading, animated star display,
 * earned-stars label, and navigation buttons.
 */
export function SuccessCard({
  starsEarned = 0,
  onNext,
  onHome,
  onRetry,
}: SuccessCardProps) {
  const stars = Math.max(0, Math.min(3, starsEarned));

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      {/* Heading */}
      <h2 className="text-4xl font-extrabold text-foreground">
        Great Job!
      </h2>

      {/* Stars */}
      <div className="flex items-center gap-3" aria-label={`${stars} stars earned`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "text-5xl leading-none select-none",
              i < stars
                ? "text-star-yellow animate-bounce"
                : "text-muted-foreground/30",
            )}
            style={
              i < stars ? { animationDelay: `${i * 150}ms` } : undefined
            }
            role="img"
            aria-hidden="true"
          >
            ⭐
          </span>
        ))}
      </div>

      {/* Earned label */}
      <p className="text-lg font-bold text-muted-foreground">
        {stars} {stars === 1 ? "Star" : "Stars"} Earned
      </p>

      {/* Primary action */}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          className={cn(
            "min-h-[48px] min-w-[200px] rounded-2xl bg-primary px-8 py-4",
            "text-lg font-bold text-primary-foreground shadow-md",
            "cursor-pointer select-none",
            "transition-transform active:scale-95 hover:shadow-lg",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          Next Activity
        </button>
      )}

      {/* Secondary actions */}
      <div className="flex items-center gap-6">
        {onHome && (
          <button
            type="button"
            onClick={onHome}
            className={cn(
              "flex min-h-[48px] min-w-[48px] flex-col items-center gap-1",
              "cursor-pointer select-none rounded-xl p-3",
              "text-muted-foreground hover:text-foreground",
              "transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
            aria-label="Go home"
          >
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">
              home
            </span>
            <span className="text-sm font-medium">Home</span>
          </button>
        )}

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              "flex min-h-[48px] min-w-[48px] flex-col items-center gap-1",
              "cursor-pointer select-none rounded-xl p-3",
              "text-muted-foreground hover:text-foreground",
              "transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
            aria-label="Try again"
          >
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">
              replay
            </span>
            <span className="text-sm font-medium">Again</span>
          </button>
        )}
      </div>
    </div>
  );
}
