"use client";

import { useState } from "react";
import Link from "next/link";
import { getActiveProfileId } from "@/lib/profileStore";
import { useSettings } from "@/lib/settingsHooks";
import { cn } from "@/lib/utils";

const TILES = [
  { href: "/kid/study", emoji: "📖", label: "Study", bg: "bg-accent text-accent-foreground" },
  { href: "/kid/talk", emoji: "💬", label: "Talk", bg: "bg-primary text-primary-foreground" },
  { href: "/kid/schedule", emoji: "📋", label: "Schedule", bg: "bg-secondary text-secondary-foreground" },
  { href: "/kid/rewards", emoji: "⭐", label: "Rewards", bg: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200" },
  { href: "/kid/break", emoji: "🌿", label: "Break", bg: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200" },
] as const;

export default function Home() {
  const [profileId] = useState(() => getActiveProfileId());
  const { data: settings } = useSettings(profileId);

  const bigButtonMode = settings?.big_button_mode ?? false;
  const calmMode = settings?.calm_mode ?? false;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4 text-center">
      <span className="text-6xl" role="img" aria-label="Nest">
        🏡
      </span>
      <h1 className="text-4xl font-extrabold tracking-tight text-primary">
        RoutineNest
      </h1>
      <p className="max-w-md text-lg text-muted-foreground">
        Routines + communication for children — designed with care.
      </p>

      {/* Navigation tiles
          big_button_mode: switches to single column on mobile with larger tiles.
          calm_mode: removes hover/active scale transitions.
      */}
      <div
        className={cn(
          "grid gap-4 w-full max-w-md",
          bigButtonMode
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-2 sm:grid-cols-3",
        )}
      >
        {TILES.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={cn(
              "inline-flex flex-col items-center justify-center gap-3 rounded-2xl px-4 font-bold shadow-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              // Big-button mode: taller tiles, larger text
              bigButtonMode
                ? "min-h-[150px] py-6 text-xl"
                : "min-h-[120px] py-5 text-lg",
              // Calm mode: no scale animations
              calmMode ? "" : "transition-transform hover:scale-105 active:scale-95",
              tile.bg,
            )}
          >
            <span
              className={cn(bigButtonMode ? "text-5xl" : "text-4xl")}
              aria-hidden="true"
            >
              {tile.emoji}
            </span>
            <span>{tile.label}</span>
          </Link>
        ))}
      </div>

      <Link
        href="/login"
        className="mt-4 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
      >
        Parent / Caregiver Sign In →
      </Link>
    </div>
  );
}
