"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ParentStatCardProps {
  /** Card title */
  title: string;
  /** Primary stat value to display prominently */
  value: string | number;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Material Symbol icon name */
  icon?: string;
  /** Icon background colour class */
  iconBg?: string;
  /** Icon text colour class */
  iconColor?: string;
  /** Trend direction: positive (+), negative (-), or neutral */
  trend?: "up" | "down" | "neutral";
  /** Trend text (e.g. "+3 this week") */
  trendLabel?: string;
  /** Extra CSS classes */
  className?: string;
  /** Optional children rendered below the stat */
  children?: ReactNode;
}

/**
 * Stat card for the parent dashboard and progress pages.
 * Displays a prominent metric with optional icon, trend indicator, and subtitle.
 */
export function ParentStatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
  trend,
  trendLabel,
  className,
  children,
}: ParentStatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm",
        className,
      )}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              iconBg,
            )}
          >
            <span
              className={cn("material-symbols-outlined text-xl", iconColor)}
              aria-hidden="true"
            >
              {icon}
            </span>
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-semibold text-muted-foreground">
            {title}
          </span>
          <span className="text-2xl font-extrabold text-foreground leading-tight">
            {value}
          </span>
        </div>
      </div>

      {/* Trend indicator */}
      {trendLabel && (
        <div
          className={cn(
            "inline-flex items-center gap-1 self-start rounded-full px-2.5 py-0.5 text-xs font-bold",
            trend === "up"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : trend === "down"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-muted text-muted-foreground",
          )}
        >
          {trend === "up" && (
            <span className="material-symbols-outlined text-xs" aria-hidden="true">trending_up</span>
          )}
          {trend === "down" && (
            <span className="material-symbols-outlined text-xs" aria-hidden="true">trending_down</span>
          )}
          {trendLabel}
        </div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}

      {/* Optional children */}
      {children}
    </div>
  );
}
