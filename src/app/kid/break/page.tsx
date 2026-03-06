"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSettings } from "@/lib/settingsHooks";
import { getActiveProfileId } from "@/lib/profileStore";
import { KidShell } from "@/components/kid/KidShell";
import { BreathingCircle } from "@/components/kid/BreathingCircle";
import { cn } from "@/lib/utils";

const CALM_PROMPTS = [
  { emoji: "🌊", text: "Breathe in… and out…" },
  { emoji: "🌈", text: "Think of your favourite colour" },
  { emoji: "🧸", text: "Give yourself a big hug" },
  { emoji: "🎵", text: "Hum your favourite song" },
  { emoji: "🌟", text: "You are doing great!" },
  { emoji: "🌳", text: "Imagine a quiet forest" },
  { emoji: "☁️", text: "Watch the clouds float by" },
  { emoji: "🐢", text: "Slow and steady like a turtle" },
] as const;

const PHASE_SEQUENCE: Array<"in" | "hold" | "out"> = [
  "in",
  "hold",
  "out",
  "hold",
];
const PHASE_DURATION_MS = 4000;

export default function BreakPage() {
  const [profileId] = useState(() => getActiveProfileId());
  const { data: settings } = useSettings(profileId);
  const calmMode = settings?.calm_mode ?? false;

  const [promptIndex, setPromptIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);

  // Cycle breathing phases every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASE_SEQUENCE.length);
    }, PHASE_DURATION_MS);
    return () => clearInterval(interval);
  }, []);

  // Cycle through calm prompts every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % CALM_PROMPTS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Simple break timer
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const toggleTimer = useCallback(() => {
    setTimerActive((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setTimerActive(false);
    setSeconds(0);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const prompt = CALM_PROMPTS[promptIndex];
  const breathPhase = PHASE_SEQUENCE[phaseIndex];

  return (
    <KidShell
      title="Break Time"
      emoji="🌿"
      trailing={
        <Link
          href="/"
          aria-label="Close"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          ✕
        </Link>
      }
    >
      <div className="relative flex flex-col items-center gap-8">
        {/* Decorative background blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -left-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-secondary/10 blur-3xl"
        />

        {/* Breathing circle */}
        <BreathingCircle phase={breathPhase} calm={calmMode} />

        {/* Cycling calm prompt (secondary) */}
        <p
          className="text-center text-lg text-muted-foreground"
          aria-live="polite"
        >
          <span aria-hidden="true">{prompt.emoji} </span>
          {prompt.text}
        </p>

        {/* Break timer */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex items-center gap-2"
            role="timer"
            aria-label={`${minutes} minutes ${secs} seconds`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/10 text-3xl font-extrabold tabular-nums text-foreground">
              {String(minutes).padStart(2, "0")}
            </span>
            <span className="text-3xl font-extrabold text-muted-foreground">
              :
            </span>
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/10 text-3xl font-extrabold tabular-nums text-foreground">
              {String(secs).padStart(2, "0")}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={toggleTimer}
              className={cn(
                "rounded-2xl border-2 border-primary bg-primary/10 px-8 py-4",
                "text-lg font-bold text-primary",
                "hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                calmMode ? "" : "transition-transform active:scale-95",
              )}
            >
              {timerActive ? "⏸ Pause" : "▶️ Start Timer"}
            </button>
            {seconds > 0 && (
              <button
                type="button"
                onClick={resetTimer}
                className={cn(
                  "rounded-2xl border-2 border-secondary bg-secondary/10 px-6 py-4",
                  "text-lg font-bold text-muted-foreground",
                  "hover:bg-secondary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  calmMode ? "" : "transition-transform active:scale-95",
                )}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Back to home */}
        <Link
          href="/"
          className={cn(
            "w-full max-w-sm rounded-2xl bg-primary px-8 py-4 text-center",
            "text-lg font-bold text-primary-foreground shadow-sm",
            "hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            calmMode ? "" : "transition-transform active:scale-95",
          )}
        >
          I&apos;m Ready! 💪
        </Link>
      </div>
    </KidShell>
  );
}
