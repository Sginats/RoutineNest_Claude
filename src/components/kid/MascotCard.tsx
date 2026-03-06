"use client";

import { cn } from "@/lib/utils";

interface MascotCardProps {
  /** Optional message displayed below the mascot */
  message?: string;
  /** Mascot size variant */
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: { card: "p-3 gap-2", emoji: "text-4xl", text: "text-sm" },
  md: { card: "p-4 gap-3", emoji: "text-6xl", text: "text-base" },
  lg: { card: "p-6 gap-4", emoji: "text-8xl", text: "text-lg" },
} as const;

/**
 * A cute mascot display card with a bird emoji placeholder.
 * Shows an optional message below the mascot on a soft tinted background.
 */
export function MascotCard({ message, size = "md" }: MascotCardProps) {
  const s = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl",
        "bg-primary/10 backdrop-blur-sm shadow-sm",
        s.card,
      )}
    >
      <span
        className={cn("leading-none select-none", s.emoji)}
        role="img"
        aria-label="Mascot bird"
      >
        🐦
      </span>

      {message && (
        <p
          className={cn(
            "text-center font-medium text-foreground/80",
            s.text,
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}
