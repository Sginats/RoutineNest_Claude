"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * Tap-the-correct-answer activity.
 * Shows 3–4 labelled options; the child taps the correct one.
 * The correct answer is always the first option in `choices` — they are
 * shuffled on first render so position is randomised.
 */

interface TapCorrectProps {
  instructions: string;
  /** First element is always the correct answer */
  choices: { label: string; emoji: string }[];
  calm: boolean;
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

export function TapCorrectActivity({ instructions, choices, calm, onComplete }: TapCorrectProps) {
  const [shuffled] = useState(() => shuffle(choices));
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);

  const handleTap = useCallback(
    (index: number) => {
      if (correct === true) return;
      setSelected(index);
      const isCorrect = shuffled[index].label === choices[0].label;
      setCorrect(isCorrect);
      if (isCorrect) {
        setTimeout(onComplete, calm ? 400 : 1000);
      } else {
        setTimeout(() => {
          setSelected(null);
          setCorrect(null);
        }, 800);
      }
    },
    [shuffled, choices, correct, calm, onComplete],
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <p className="text-center text-lg text-muted-foreground">{instructions}</p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {shuffled.map((choice, i) => {
          const isSelected = selected === i;
          const isRight = isSelected && correct === true;
          const isWrong = isSelected && correct === false;

          return (
            <button
              key={`${choice.label}-${choice.emoji}`}
              type="button"
              onClick={() => handleTap(i)}
              className={cn(
                "min-h-[100px] rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2",
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
              <span className="text-3xl" aria-hidden="true">{choice.emoji}</span>
              <span>{choice.label}</span>
            </button>
          );
        })}
      </div>
      {correct === true && (
        <p className="text-xl font-bold text-success" aria-live="polite">
          ✅ Correct!
        </p>
      )}
      {correct === false && (
        <p className="text-lg text-muted-foreground" aria-live="polite">
          Try again!
        </p>
      )}
    </div>
  );
}
