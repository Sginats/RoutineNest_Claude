"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSettings } from "@/lib/settingsHooks";
import { getActiveProfileId } from "@/lib/profileStore";
import { KidShell } from "@/components/kid/KidShell";
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

export default function BreakPage() {
  const [profileId] = useState(() => getActiveProfileId());
  const { data: settings } = useSettings(profileId);
  const calmMode = settings?.calm_mode ?? false;

  const [promptIndex, setPromptIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

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

  return (
    <KidShell title="Break Time" emoji="🌿">
      <div className="flex flex-col items-center gap-8">
        {/* Calm prompt card */}
        <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-border bg-card p-8 shadow-sm w-full max-w-sm text-center">
          <span className="text-6xl" role="img" aria-hidden="true">
            {prompt.emoji}
          </span>
          <p
            className="text-2xl font-bold text-primary"
            aria-live="polite"
          >
            {prompt.text}
          </p>
        </div>

        {/* Break timer */}
        <div className="flex flex-col items-center gap-4">
          <p className="text-5xl font-extrabold tabular-nums text-muted-foreground" role="timer" aria-label={`${minutes} minutes ${secs} seconds`}>
            {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </p>
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
            "rounded-2xl border-2 border-success bg-success/10 px-8 py-4",
            "text-lg font-bold text-success",
            "hover:bg-success/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            calmMode ? "" : "transition-transform active:scale-95",
          )}
        >
          I&apos;m Ready! 💪
        </Link>
      </div>
    </KidShell>
  );
}
