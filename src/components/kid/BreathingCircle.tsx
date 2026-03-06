"use client";

import { cn } from "@/lib/utils";

interface BreathingCircleProps {
  /** Current breathing phase */
  phase?: "in" | "out" | "hold";
  /** Disable animations */
  calm?: boolean;
}

const ANIMATION_DURATION = "3s";

const phaseLabels: Record<string, string> = {
  in: "Breathe In",
  out: "Breathe Out",
  hold: "Hold",
};

/**
 * Calming break breathing exercise with concentric circles.
 * Three layers at varying opacities pulse around a center icon.
 * Animations are suppressed when calm mode is active.
 */
export function BreathingCircle({
  phase = "in",
  calm = false,
}: BreathingCircleProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Concentric circles */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <div
          className={cn(
            "absolute h-48 w-48 rounded-full bg-primary/30",
            !calm && "animate-pulse",
          )}
          style={!calm ? { animationDuration: ANIMATION_DURATION } : undefined}
        />
        {/* Middle ring */}
        <div
          className={cn(
            "absolute h-36 w-36 rounded-full bg-primary/40",
            !calm && "animate-pulse",
          )}
          style={!calm ? { animationDuration: ANIMATION_DURATION, animationDelay: "200ms" } : undefined}
        />
        {/* Inner circle */}
        <div
          className={cn(
            "relative flex h-24 w-24 items-center justify-center rounded-full bg-primary",
            !calm && "animate-pulse",
          )}
          style={!calm ? { animationDuration: ANIMATION_DURATION, animationDelay: "400ms" } : undefined}
        >
          <span
            className="material-symbols-outlined text-4xl text-primary-foreground"
            aria-hidden="true"
          >
            air
          </span>
        </div>
      </div>

      {/* Phase label */}
      <p className="text-2xl font-bold text-foreground">
        {phaseLabels[phase]}
      </p>
    </div>
  );
}
