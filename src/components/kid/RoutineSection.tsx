"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface RoutineSectionProps {
  /** Section heading */
  title: string;
  /** Section content */
  children: ReactNode;
  /** Optional action button on the right side of the heading */
  action?: { label: string; onClick: () => void };
}

/**
 * Section wrapper for grouping items on kid-facing pages.
 * Renders a bold heading with an optional action link and children below.
 */
export function RoutineSection({
  title,
  children,
  action,
}: RoutineSectionProps) {
  return (
    <section className="mb-8 px-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className={cn(
              "min-h-[48px] min-w-[48px] rounded-lg px-3 py-2",
              "text-sm font-semibold text-primary",
              "cursor-pointer select-none",
              "hover:bg-primary/10",
              "transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            {action.label}
          </button>
        )}
      </div>

      {children}
    </section>
  );
}
