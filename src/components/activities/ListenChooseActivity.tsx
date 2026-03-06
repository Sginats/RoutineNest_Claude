"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/tts";

/**
 * Listen-and-choose activity.
 *
 * Behavior:
 * - Shows a prompt text (and optionally speaks it via TTS)
 * - Displays 3–4 labelled answer tiles
 * - Child taps the correct answer
 * - Correct answer → brief success state → onComplete()
 * - Wrong answer → gentle retry feedback (tile shakes, message)
 *
 * Supports calm mode (reduces animation) and sound_enabled setting.
 */

export interface ListenChoiceOption {
  label: string;
  emoji: string;
}

interface ListenChooseProps {
  /** The question or prompt text shown (and optionally spoken) */
  instructions: string;
  /** All answer options — the FIRST element is always the correct answer */
  choices: ListenChoiceOption[];
  /** Disable motion / animation effects */
  calm: boolean;
  /** Whether TTS / sound is enabled */
  soundEnabled: boolean;
  /** Called when the child selects the correct answer */
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

export function ListenChooseActivity({
  instructions,
  choices,
  calm,
  soundEnabled,
  onComplete,
}: ListenChooseProps) {
  // Shuffle once on mount and keep stable
  const [shuffled] = useState(() => shuffle(choices));
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [hasSpoken, setHasSpoken] = useState(false);
  const spokenRef = useRef(false);

  // Speak the prompt once on mount (if sound enabled)
  useEffect(() => {
    if (spokenRef.current) return;
    if (!soundEnabled) return;
    spokenRef.current = true;
    setTimeout(() => {
      speak(instructions, soundEnabled);
      setHasSpoken(true);
    }, 400);
  }, [instructions, soundEnabled]);

  const handleSpeak = useCallback(() => {
    speak(instructions, soundEnabled);
    setHasSpoken(true);
  }, [instructions, soundEnabled]);

  const handleTap = useCallback(
    (index: number) => {
      if (correct === true) return;
      setSelected(index);
      const isCorrect = shuffled[index].label === choices[0].label;
      setCorrect(isCorrect);
      if (isCorrect) {
        if (soundEnabled) {
          speak("Correct! Well done!", soundEnabled);
        }
        setTimeout(onComplete, calm ? 400 : 1000);
      } else {
        setTimeout(() => {
          setSelected(null);
          setCorrect(null);
        }, 900);
      }
    },
    [shuffled, choices, correct, calm, soundEnabled, onComplete],
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Prompt area with listen button */}
      <div className="flex flex-col items-center gap-3 w-full max-w-sm">
        <div className="rounded-2xl bg-primary/5 border border-primary/20 px-5 py-4 text-center w-full">
          <p className="text-lg font-bold text-foreground leading-snug">
            {instructions}
          </p>
        </div>
        {/* Listen / repeat button */}
        <button
          type="button"
          onClick={handleSpeak}
          className={cn(
            "flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2",
            "text-sm font-semibold text-primary",
            "hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            calm ? "" : "transition-transform active:scale-95",
          )}
          aria-label="Listen to the question again"
        >
          🔊 {hasSpoken ? "Listen again" : "Listen"}
        </button>
      </div>

      {/* Answer tiles */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {shuffled.map((choice, i) => {
          const isSelected = selected === i;
          const isRight = isSelected && correct === true;
          const isWrong = isSelected && correct === false;

          return (
            <button
              key={`${choice.label}-${i}`}
              type="button"
              onClick={() => handleTap(i)}
              className={cn(
                "min-h-[110px] rounded-2xl border-2 p-4",
                "flex flex-col items-center justify-center gap-2",
                "text-lg font-bold",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isRight
                  ? "border-success bg-success/15 scale-105"
                  : isWrong
                  ? "border-destructive bg-destructive/10 animate-pulse"
                  : "border-border bg-card hover:border-primary/60",
                calm ? "" : "transition-all active:scale-95",
              )}
              aria-label={choice.label}
            >
              <span className="text-4xl" aria-hidden="true">
                {choice.emoji}
              </span>
              <span className="text-base leading-tight text-center">
                {choice.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback messages */}
      {correct === true && (
        <p className="text-xl font-bold text-success" aria-live="polite">
          ✅ Correct! Great listening!
        </p>
      )}
      {correct === false && (
        <p className="text-lg text-muted-foreground" aria-live="polite">
          Not quite — try again! 🎧
        </p>
      )}
    </div>
  );
}
