"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getActiveProfileId } from "@/lib/profileStore";
import { useSettings } from "@/lib/settingsHooks";

const NAV_ITEMS = [
  { href: "/kid/talk", label: "Talk", emoji: "💬" },
  { href: "/kid/study", label: "Study", emoji: "📖" },
  { href: "/kid/schedule", label: "Tasks", emoji: "📋" },
  { href: "/kid/rewards", label: "Stars", emoji: "⭐" },
  { href: "/parent", label: "Parent", emoji: "👤" },
  { href: "/settings", label: "Settings", emoji: "⚙️" },
] as const;

export function NavBar() {
  const pathname = usePathname();
  const [profileId] = useState(() => getActiveProfileId());
  const { data: settings } = useSettings(profileId);
  const calmMode = settings?.calm_mode ?? false;

  // Sync calm class on <html> whenever the setting changes
  useEffect(() => {
    const html = document.documentElement;
    if (calmMode) {
      html.classList.add("calm");
    } else {
      html.classList.remove("calm");
    }
    return () => html.classList.remove("calm");
  }, [calmMode]);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-card shadow-sm">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-1 px-3">
        {/* Brand */}
        <Link
          href="/"
          className="mr-auto flex items-center gap-2 text-lg font-extrabold tracking-tight text-primary"
        >
          <span role="img" aria-label="nest">🏡</span>
          <span className="hidden sm:inline">RoutineNest</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map(({ href, label, emoji }) => {
            const isActive =
              pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl px-2.5 py-1 text-xs font-semibold min-w-[52px]",
                  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="text-lg leading-none" aria-hidden="true">
                  {emoji}
                </span>
                <span className="mt-0.5">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
