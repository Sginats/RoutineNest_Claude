"use client";

import { useState } from "react";
import Link from "next/link";
import { getActiveProfileId } from "@/lib/profileStore";
import { useSettings } from "@/lib/settingsHooks";
import { cn } from "@/lib/utils";

const TILES = [
  {
    href: "/kid/study",
    icon: "school",
    label: "Study",
    bg: "bg-kid-teal",
    shadow: "shadow-kid-teal/20",
    text: "text-white",
  },
  {
    href: "/kid/talk",
    icon: "chat_bubble",
    label: "Talk",
    bg: "bg-kid-coral",
    shadow: "shadow-kid-coral/20",
    text: "text-white",
  },
  {
    href: "/kid/schedule",
    icon: "calendar_month",
    label: "Schedule",
    bg: "bg-kid-yellow",
    shadow: "shadow-kid-yellow/20",
    text: "text-slate-800",
  },
  {
    href: "/kid/rewards",
    icon: "stars",
    label: "Rewards",
    bg: "bg-kid-blue",
    shadow: "shadow-kid-blue/20",
    text: "text-white",
  },
  {
    href: "/kid/break",
    icon: "potted_plant",
    label: "Break",
    bg: "bg-kid-mint",
    shadow: "shadow-kid-mint/20",
    text: "text-white",
  },
] as const;

export default function Home() {
  const [profileId] = useState(() => getActiveProfileId());
  const { data: settings } = useSettings(profileId);

  const bigButtonMode = settings?.big_button_mode ?? false;
  const calmMode = settings?.calm_mode ?? false;

  return (
    <div className="flex min-h-[80vh] flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-primary">
          🏡 RoutineNest
        </h1>
        <Link
          href="/login"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full bg-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            calmMode ? "" : "transition-colors hover:bg-muted/80",
          )}
          aria-label="Parent / Caregiver Sign In"
        >
          <span className="material-symbols-outlined text-xl text-muted-foreground" aria-hidden="true">
            lock
          </span>
        </Link>
      </header>

      {/* Welcome message */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
          Hi there! 👋
        </h2>
        <p className="mt-1 text-lg text-muted-foreground">
          What do you want to do today?
        </p>
      </div>

      {/* Navigation tiles */}
      <div
        className={cn(
          "grid w-full gap-4",
          bigButtonMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3",
        )}
      >
        {TILES.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={cn(
              "group flex flex-col items-center justify-center gap-4 rounded-2xl p-6 shadow-lg",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              bigButtonMode ? "min-h-[200px]" : "min-h-[160px]",
              calmMode ? "" : "transition-transform active:scale-95",
              tile.bg,
              tile.shadow,
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-full bg-white/20",
                bigButtonMode ? "h-24 w-24" : "h-20 w-20",
                tile.text,
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined",
                  bigButtonMode ? "text-7xl" : "text-6xl",
                )}
                aria-hidden="true"
              >
                {tile.icon}
              </span>
            </div>
            <span className={cn("text-2xl font-extrabold", tile.text)}>
              {tile.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Bottom nav bar */}
      <nav
        className="mt-auto flex items-center justify-around rounded-2xl bg-card py-3 shadow-md border border-border"
        aria-label="Bottom navigation"
      >
        {[
          { href: "/", icon: "home", label: "Home", active: true },
          { href: "/kid/study", icon: "handyman", label: "Tools", active: false },
          { href: "/kid/rewards", icon: "person", label: "Me", active: false },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-4 py-1",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              item.active
                ? "text-primary"
                : "text-muted-foreground",
              calmMode ? "" : "transition-colors",
            )}
            aria-current={item.active ? "page" : undefined}
          >
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">
              {item.icon}
            </span>
            <span className="text-xs font-semibold">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
