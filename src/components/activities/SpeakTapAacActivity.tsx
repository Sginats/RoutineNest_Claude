"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/tts";

/**
 * Speak-and-tap AAC activity.
 *
 * Behavior:
 * - Shows a communication prompt (e.g. "Which word means you want something?")
 * - Displays large AAC-style response tiles (emoji + label)
 * - Child taps the correct response tile
 * - Correct tap → TTS speaks the word → brief success state → onComplete()
 * - Wrong tap → gentle retry feedback
 *
 * Visual design follows the AAC talk board style — large accessible tiles
 * with prominent emoji and clear labels.
 * Supports calm mode and sound_enabled setting.
 */

export interface AacResponseOption {
  label: string;
  emoji: string;
  /** Optional TTS phrase to speak on correct selection (defaults to label) */
  speakText?: string;
}

interface SpeakTapAacProps {
  /** The communication prompt displayed to the child */
  instructions: string;
  /** Response options — FIRST element is always the correct answer */
  options: AacResponseOption[];
  /** Disable motion / animation effects */
  calm: boolean;
  /** Whether TTS / sound is enabled */
  soundEnabled: boolean;
  /** Called when the child selects the correct response */
  onComplete: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SpeakTapAacActivity({
  instructions,
  options,
  calm,
  soundEnabled,
  onComplete,
}: SpeakTapAacProps) {
  // Shuffle once on mount so position is randomised
  const [shuffled] = useState(() => shuffle(options));
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);

  const handleTap = useCallback(
    (index: number) => {
      if (correct === true) return;
      setSelected(index);
      const isCorrect = shuffled[index].label === options[0].label;
      setCorrect(isCorrect);

      if (isCorrect) {
        // Speak the correct answer (AAC-style feedback)
        const toSpeak =
          shuffled[index].speakText ?? shuffled[index].label;
        if (soundEnabled) {
          speak(toSpeak, soundEnabled);
        }
        setTimeout(onComplete, calm ? 600 : 1200);
      } else {
        // Gentle retry — briefly show "try again" then reset
        setTimeout(() => {
          setSelected(null);
          setCorrect(null);
        }, 900);
      }
    },
    [shuffled, options, correct, calm, soundEnabled, onComplete],
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Communication prompt */}
      <div className="rounded-2xl bg-accent/10 border border-accent/30 px-5 py-4 text-center w-full max-w-sm">
        <p className="text-lg font-bold text-foreground leading-snug">
          {instructions}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap the right answer 👇
        </p>
      </div>

      {/* AAC response tiles — large accessible buttons */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {shuffled.map((option, i) => {
          const isSelected = selected === i;
          const isRight = isSelected && correct === true;
          const isWrong = isSelected && correct === false;

          return (
            <button
              key={`${option.label}-${i}`}
              type="button"
              onClick={() => handleTap(i)}
              className={cn(
                // AAC-style: large, clear, easy to tap
                "min-h-[130px] rounded-3xl border-2 p-4",
                "flex flex-col items-center justify-center gap-3",
                "cursor-pointer select-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isRight
                  ? "border-success bg-success/15 scale-105 shadow-success/20 shadow-md"
                  : isWrong
                  ? "border-destructive bg-destructive/10 animate-pulse"
                  : "border-border bg-card hover:border-primary/50 hover:bg-primary/5",
                calm ? "" : "transition-all active:scale-95",
              )}
              aria-label={option.label}
              aria-pressed={isRight}
            >
              {/* Large AAC-style emoji */}
              <span className="text-5xl leading-none" aria-hidden="true">
                {option.emoji}
              </span>
              {/* Clear label */}
              <span className="text-base font-extrabold leading-tight text-center text-foreground">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback messages */}
      {correct === true && (
        <p
          className="text-xl font-bold text-success"
          aria-live="polite"
          role="status"
        >
          ✅ That&apos;s right!
        </p>
      )}
      {correct === false && (
        <p
          className="text-lg text-muted-foreground"
          aria-live="polite"
          role="status"
        >
          Try again — you can do it! 💪
        </p>
      )}
    </div>
  );
}
