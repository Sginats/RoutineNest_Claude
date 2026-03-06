"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * Visual matching activity.
 * Shows items on the left and targets on the right. The child taps a left
 * item, then taps the matching right item to form a pair.
 */

interface MatchPair {
  id: string;
  label: string;
  emoji: string;
  matchLabel: string;
  matchEmoji: string;
}

interface VisualMatchingProps {
  instructions: string;
  pairs: MatchPair[];
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

export function VisualMatchingActivity({
  instructions,
  pairs,
  calm,
  onComplete,
}: VisualMatchingProps) {
  const [shuffledTargets] = useState(() => shuffle(pairs));
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);

  const handleSourceTap = useCallback(
    (id: string) => {
      if (matched.has(id)) return;
      setSelectedSource(id);
      setWrong(null);
    },
    [matched],
  );

  const handleTargetTap = useCallback(
    (targetId: string) => {
      if (!selectedSource) return;
      if (matched.has(targetId)) return;

      if (selectedSource === targetId) {
        const next = new Set(matched);
        next.add(targetId);
        setMatched(next);
        setSelectedSource(null);
        setWrong(null);
        if (next.size === pairs.length) {
          setTimeout(onComplete, calm ? 400 : 1000);
        }
      } else {
        setWrong(targetId);
        setTimeout(() => {
          setWrong(null);
          setSelectedSource(null);
        }, 600);
      }
    },
    [selectedSource, matched, pairs.length, calm, onComplete],
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <p className="text-center text-lg text-muted-foreground">{instructions}</p>

      <div className="flex gap-6 w-full max-w-md justify-center">
        {/* Source column */}
        <div className="flex flex-col gap-3">
          {pairs.map((pair) => {
            const isMatched = matched.has(pair.id);
            const isSelected = selectedSource === pair.id;
            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => handleSourceTap(pair.id)}
                disabled={isMatched}
                className={cn(
                  "min-h-[72px] min-w-[100px] rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-1",
                  "text-sm font-bold",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isMatched
                    ? "border-success/40 bg-success/10 opacity-60"
                    : isSelected
                      ? "border-primary bg-primary/15 scale-105"
                      : "border-border bg-card hover:border-primary/60",
                  calm ? "" : "transition-all",
                )}
                aria-label={pair.label}
              >
                <span className="text-2xl" aria-hidden="true">{pair.emoji}</span>
                <span>{pair.label}</span>
              </button>
            );
          })}
        </div>

        {/* Target column */}
        <div className="flex flex-col gap-3">
          {shuffledTargets.map((pair) => {
            const isMatched = matched.has(pair.id);
            const isWrong = wrong === pair.id;
            return (
              <button
                key={`t-${pair.id}`}
                type="button"
                onClick={() => handleTargetTap(pair.id)}
                disabled={isMatched}
                className={cn(
                  "min-h-[72px] min-w-[100px] rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-1",
                  "text-sm font-bold",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isMatched
                    ? "border-success/40 bg-success/10 opacity-60"
                    : isWrong
                      ? "border-destructive bg-destructive/10"
                      : "border-border bg-card hover:border-accent/60",
                  calm ? "" : "transition-all",
                )}
                aria-label={pair.matchLabel}
              >
                <span className="text-2xl" aria-hidden="true">{pair.matchEmoji}</span>
                <span>{pair.matchLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {matched.size === pairs.length && (
        <p className="text-xl font-bold text-success" aria-live="polite">
          ✅ All matched!
        </p>
      )}

      {selectedSource && matched.size < pairs.length && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Now tap the matching item on the right →
        </p>
      )}
    </div>
  );
}
