"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * Sequencing activity.
 * Shows steps in a scrambled order; the child taps them in the correct
 * sequence to complete the activity.
 */

interface SequencingProps {
  instructions: string;
  /** Steps in the CORRECT order */
  steps: { label: string; emoji: string }[];
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

export function SequencingActivity({
  instructions,
  steps,
  calm,
  onComplete,
}: SequencingProps) {
  const [shuffled] = useState(() =>
    shuffle(steps.map((s, i) => ({ ...s, correctIndex: i }))),
  );
  const [nextCorrectIndex, setNextCorrectIndex] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);

  const handleTap = useCallback(
    (shuffledIdx: number) => {
      const item = shuffled[shuffledIdx];
      if (completed.includes(shuffledIdx)) return;

      if (item.correctIndex === nextCorrectIndex) {
        const next = [...completed, shuffledIdx];
        setCompleted(next);
        setNextCorrectIndex(nextCorrectIndex + 1);
        setWrongIndex(null);
        if (next.length === steps.length) {
          setTimeout(onComplete, calm ? 400 : 1000);
        }
      } else {
        setWrongIndex(shuffledIdx);
        setTimeout(() => setWrongIndex(null), 600);
      }
    },
    [shuffled, completed, nextCorrectIndex, steps.length, calm, onComplete],
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <p className="text-center text-lg text-muted-foreground">{instructions}</p>

      {/* Progress — show correctly ordered steps so far */}
      {completed.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {completed.map((idx, pos) => (
            <div
              key={`done-${idx}`}
              className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-sm font-bold text-success"
            >
              <span className="text-base" aria-hidden="true">
                {shuffled[idx].emoji}
              </span>
              <span>
                {pos + 1}. {shuffled[idx].label}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm font-semibold text-primary">
        Step {nextCorrectIndex + 1} of {steps.length} — tap what comes next
      </p>

      {/* Scrambled options */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {shuffled.map((item, i) => {
          const isDone = completed.includes(i);
          const isWrong = wrongIndex === i;

          return (
            <button
              key={`seq-${i}`}
              type="button"
              onClick={() => handleTap(i)}
              disabled={isDone}
              className={cn(
                "min-h-[60px] rounded-xl border-2 p-4 flex items-center gap-4",
                "text-base font-bold",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isDone
                  ? "border-success/40 bg-success/10 opacity-50"
                  : isWrong
                    ? "border-destructive bg-destructive/10 animate-pulse"
                    : "border-border bg-card hover:border-primary/60",
                calm ? "" : "transition-all active:scale-95",
              )}
              aria-label={item.label}
            >
              <span className="text-2xl" aria-hidden="true">{item.emoji}</span>
              <span>{item.label}</span>
              {isDone && <span className="ml-auto text-success">✅</span>}
            </button>
          );
        })}
      </div>

      {completed.length === steps.length && (
        <p className="text-xl font-bold text-success" aria-live="polite">
          ✅ Perfect order!
        </p>
      )}
    </div>
  );
}
