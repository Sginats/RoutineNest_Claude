"use client";

import { useState, useEffect, useCallback } from "react";
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

interface SentenceWord {
  label: string;
  icon?: string;
}

export default function TalkPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [profileId] = useState(() => getActiveProfileId());
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [sentence, setSentence] = useState<SentenceWord[]>([]);

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
  const bigButtonMode = settings?.big_button_mode ?? false;

  // Track screen view once user and profile are ready
  useEffect(() => {
    if (user && profileId) {
      trackScreen("talk");
    }
  }, [user, profileId]);

  function handleTap(card: CardType) {
    setPressedId(card.id);
    const text = card.tts_text?.trim() || card.label;
    // Speak the individual word
    speak(text, soundEnabled);
    // Add word to sentence bar
    setSentence((prev) => [...prev, { label: card.label, icon: card.image_url ?? undefined }]);
    // Track category only — never label or tts_text
    trackAACCardTapped(card.category);
    // Clear pressed state after a short delay
    setTimeout(() => setPressedId(null), 300);
  }

  const handleBackspace = useCallback(() => {
    setSentence((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setSentence([]);
  }, []);

  const handleSpeak = useCallback(() => {
    if (sentence.length === 0) return;
    const fullText = sentence.map((w) => w.label).join(" ");
    speak(fullText, soundEnabled);
  }, [sentence, soundEnabled]);

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

  // Grid column count: 3-col default, big_button_mode caps at 2
  const effectiveGridSize = bigButtonMode ? Math.min(gridSize, 2) : gridSize;
  const gridCols =
    effectiveGridSize === 2
      ? "grid-cols-2"
      : effectiveGridSize === 4
        ? "grid-cols-4"
        : "grid-cols-3";

  return (
    <KidShell title="Talk Board" emoji="💬">
      {/* Sentence bar */}
      <div className="flex items-center gap-2 rounded-xl bg-white p-3 shadow">
        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          {sentence.length === 0 ? (
            <span className="text-sm text-muted-foreground">Tap cards to build a sentence…</span>
          ) : (
            sentence.map((word, i) => (
              <span
                key={i}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
              >
                {word.icon && (
                  <img src={word.icon} alt="" className="h-5 w-5 rounded" />
                )}
                {word.label}
              </span>
            ))
          )}
        </div>
        <button
          type="button"
          onClick={handleBackspace}
          disabled={sentence.length === 0}
          className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted disabled:opacity-30"
          aria-label="Remove last word"
        >
          <span className="material-symbols-outlined text-xl">backspace</span>
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={sentence.length === 0}
          className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted disabled:opacity-30"
          aria-label="Clear sentence"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Card grid */}
      <div className={cn("grid gap-4", gridCols)}>
        {cards.map((card) => (
          <BigTileButton
            key={card.id}
            label={card.label}
            imageUrl={card.image_url}
            fallbackEmoji="💬"
            calm={calmMode}
            bigButtonMode={bigButtonMode}
            pressed={pressedId === card.id}
            ariaLabel={card.label}
            onClick={() => handleTap(card)}
          />
        ))}
      </div>

      {/* Speak button */}
      <button
        type="button"
        onClick={handleSpeak}
        disabled={sentence.length === 0}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-md",
          "disabled:opacity-40",
          !calmMode && "transition-transform active:scale-[0.98]",
        )}
        aria-label="Speak sentence"
      >
        <span className="material-symbols-outlined text-2xl">volume_up</span>
        Speak
      </button>

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
