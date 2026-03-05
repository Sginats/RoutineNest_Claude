"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import { getActiveProfileId } from "@/lib/profileStore";
import { useSettings } from "@/lib/settingsHooks";
import { getCards } from "@/lib/db";
import type { Card as CardType } from "@/lib/types";
import { speak } from "@/lib/tts";
import { cn } from "@/lib/utils";
import { trackScreen, trackAACCardTapped } from "@/lib/analytics";

export default function TalkPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [profileId] = useState(() => getActiveProfileId());
  const [pressedId, setPressedId] = useState<string | null>(null);

  const { data: settings } = useSettings(profileId);

  // Fetch AAC cards for the active profile
  const { data: cards, isLoading: cardsLoading } = useQuery<CardType[]>({
    queryKey: ["cards", profileId, "aac"],
    queryFn: () => getCards(profileId!, "aac"),
    enabled: !!profileId && !!user,
  });

  // Derive settings (defaults when no row exists)
  const calmMode = settings?.calm_mode ?? false;
  const gridSize = settings?.grid_size ?? 3;
  const soundEnabled = settings?.sound_enabled ?? true;

  // Track screen view once user and profile are ready
  useEffect(() => {
    if (user && profileId) {
      trackScreen("talk");
    }
  }, [user, profileId]);

  function handleTap(card: CardType) {
    setPressedId(card.id);
    const text = card.tts_text?.trim() || card.label;
    speak(text, soundEnabled);
    // Track category only — never label or tts_text
    trackAACCardTapped(card.category);
    // Clear pressed state after a short delay
    setTimeout(() => setPressedId(null), 300);
  }

  // --- Render states ---

  // Auth loading
  if (authLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading…</p>
      </div>
    );
  }

  // No profile selected
  if (!profileId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 px-4 text-center">
        <span className="text-7xl" role="img" aria-label="House">
          🏠
        </span>
        <h1 className="text-2xl font-extrabold">
          Ask a parent to set up RoutineNest
        </h1>
        <p className="text-muted-foreground text-lg">
          A grown-up needs to create your profile first.
        </p>
      </div>
    );
  }

  // Loading cards
  if (cardsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading talk board…</p>
      </div>
    );
  }

  // No AAC cards yet
  if (!cards?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 px-4 text-center">
        <span className="text-7xl" role="img" aria-label="Speech bubble">
          💬
        </span>
        <h1 className="text-2xl font-extrabold">No talk cards yet!</h1>
        <p className="text-muted-foreground text-lg">
          Ask a parent to add some talk cards.
        </p>
      </div>
    );
  }

  const gridCols =
    gridSize === 2
      ? "grid-cols-2"
      : gridSize === 4
        ? "grid-cols-4"
        : "grid-cols-3";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-primary">
        💬 Talk Board
      </h1>

      <div className={cn("grid gap-4", gridCols)}>
        {cards.map((card) => {
          const isPressed = pressedId === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleTap(card)}
              className={cn(
                "min-h-[130px] min-w-[44px] rounded-2xl border-3 p-4",
                "flex flex-col items-center justify-center gap-3 text-center",
                "cursor-pointer select-none shadow-sm",
                "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2",
                calmMode
                  ? ""
                  : "transition-transform active:scale-95 hover:shadow-md",
                isPressed
                  ? "border-primary bg-primary/15 scale-95 shadow-inner"
                  : "border-border bg-card hover:border-primary/60",
              )}
              aria-label={card.label}
            >
              {card.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={card.image_url}
                  alt=""
                  className="h-16 w-16 rounded-xl object-cover"
                  aria-hidden="true"
                />
              ) : (
                <span
                  className="text-4xl"
                  role="img"
                  aria-hidden="true"
                >
                  💬
                </span>
              )}

              <span className="text-base font-bold leading-tight">
                {card.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
