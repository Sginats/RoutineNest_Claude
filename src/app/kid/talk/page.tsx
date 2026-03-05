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
import { KidShell } from "@/components/kid/KidShell";
import { BigTileButton } from "@/components/kid/BigTileButton";
import { EmptyState } from "@/components/kid/EmptyState";

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
      <EmptyState
        emoji="🏠"
        emojiLabel="House"
        title="Ask a parent to set up RoutineNest"
        description="A grown-up needs to create your profile first."
      />
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
      <EmptyState
        emoji="💬"
        emojiLabel="Speech bubble"
        title="No talk cards yet!"
        description="Ask a parent to add some talk cards."
      />
    );
  }

  const gridCols =
    gridSize === 2
      ? "grid-cols-2"
      : gridSize === 4
        ? "grid-cols-4"
        : "grid-cols-3";

  return (
    <KidShell title="Talk Board" emoji="💬">
      <div className={cn("grid gap-4", gridCols)}>
        {cards.map((card) => (
          <BigTileButton
            key={card.id}
            label={card.label}
            imageUrl={card.image_url}
            fallbackEmoji="💬"
            calm={calmMode}
            pressed={pressedId === card.id}
            ariaLabel={card.label}
            onClick={() => handleTap(card)}
          />
        ))}
      </div>

      {/* ARASAAC attribution */}
      <p className="text-xs text-muted-foreground text-center pt-4">
        Pictograms by{" "}
        <a
          href="https://arasaac.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          ARASAAC
        </a>{" "}
        — CC BY-NC-SA 4.0. Non-commercial use only.
      </p>
    </KidShell>
  );
}
