"use client";

import { cn } from "@/lib/utils";

interface KidShellProps {
  /** Page heading text */
  title: string;
  /** Emoji shown before the title */
  emoji?: string;
  /** Optional trailing element (e.g. progress badge) */
  trailing?: React.ReactNode;
  /** Extra className on the wrapper */
  className?: string;
  children: React.ReactNode;
}

/**
 * Shared layout shell for all kid-facing pages.
 * Provides consistent spacing, heading style, and structure.
 */
export function KidShell({
  title,
  emoji,
  trailing,
  className,
  children,
}: KidShellProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-primary">
          {emoji && (
            <span aria-hidden="true" className="mr-1">
              {emoji}
            </span>
          )}
          {title}
        </h1>
        {trailing}
      </div>
      {children}
    </div>
  );
}
