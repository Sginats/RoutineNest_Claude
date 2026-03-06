"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import { getActiveProfileId } from "@/lib/profileStore";
import { useSettings } from "@/lib/settingsHooks";
import { getRewards } from "@/lib/db";
import { getChildProgress } from "@/lib/studyDb";
import { KidShell } from "@/components/kid/KidShell";
import { EmptyState } from "@/components/kid/EmptyState";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Streak calculation
// ---------------------------------------------------------------------------

function toLocalDateStr(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const MS_PER_DAY = 86_400_000;

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const unique = [...new Set(dates.map(toLocalDateStr))].sort().reverse();
  const today = toLocalDateStr(new Date().toISOString());
  const first = unique[0];
  if (!first) return 0;
  const diffFromToday = Math.floor(
    (new Date(today).getTime() - new Date(first).getTime()) / MS_PER_DAY,
  );
  if (diffFromToday > 1) return 0;
  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]!).getTime();
    const curr = new Date(unique[i]!).getTime();
    if (prev - curr === MS_PER_DAY) streak++;
    else break;
  }
  return streak;
}

// ---------------------------------------------------------------------------
// Badge definitions
// ---------------------------------------------------------------------------

const BADGES = [
  { id: "first-star", emoji: "🌟", label: "First Star", threshold: 1 },
  { id: "five-stars", emoji: "✨", label: "Rising Star", threshold: 5 },
  { id: "ten-stars", emoji: "💫", label: "Super Star", threshold: 10 },
  { id: "twenty-five-stars", emoji: "🏅", label: "Star Collector", threshold: 25 },
  { id: "fifty-stars", emoji: "🏆", label: "Champion", threshold: 50 },
  { id: "streak-3", emoji: "🔥", label: "3 Day Streak", threshold: -3 },
  { id: "streak-7", emoji: "⚡", label: "7 Day Streak", threshold: -7 },
] as const;

export default function RewardsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [profileId] = useState(() => getActiveProfileId());

  const { data: settings } = useSettings(profileId);
  const calmMode = settings?.calm_mode ?? false;

  const { data: rewards, isLoading } = useQuery({
    queryKey: ["rewards", profileId],
    queryFn: () => getRewards(profileId!),
    enabled: !!profileId && !!user,
  });

  const { data: progress } = useQuery({
    queryKey: ["childProgress", profileId],
    queryFn: () => getChildProgress(profileId!),
    enabled: !!profileId && !!user,
  });

  const totalStars = rewards?.reduce((sum, r) => sum + r.stars, 0) ?? 0;

  // Compute streak from completed activities
  const streak = useMemo(() => {
    const items = progress ?? [];
    const dates = items
      .filter((p) => p.completed && p.completed_at)
      .map((p) => p.completed_at!);
    return computeStreak(dates);
  }, [progress]);

  // Earned badges
  const earnedBadges = useMemo(() => {
    return BADGES.filter((b) => {
      if (b.threshold < 0) return streak >= Math.abs(b.threshold);
      return totalStars >= b.threshold;
    });
  }, [totalStars, streak]);

  // Track previous star count for celebration
  const [prevStars, setPrevStars] = useState(totalStars);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (totalStars > prevStars && !calmMode) {
      const showTimer = setTimeout(() => {
        setShowCelebration(true);
        setPrevStars(totalStars);
      }, 0);
      const hideTimer = setTimeout(() => setShowCelebration(false), 2000);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
    const t = setTimeout(() => setPrevStars(totalStars), 0);
    return () => clearTimeout(t);
  }, [totalStars, prevStars, calmMode]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading…</p>
      </div>
    );
  }

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

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading rewards…</p>
      </div>
    );
  }

  return (
    <KidShell title="My Stars" emoji="⭐">
      <div className="flex flex-col items-center gap-6">
        {/* Star count card */}
        <div className="relative flex flex-col items-center gap-4 rounded-3xl border-2 border-border bg-card p-8 shadow-sm w-full max-w-sm">
          {showCelebration && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-3xl bg-success/10 animate-pulse"
              aria-live="polite"
            >
              <span className="text-5xl">🎉</span>
            </div>
          )}

          <p className="text-7xl" role="img" aria-label={`${totalStars} stars`}>
            ⭐
          </p>
          <p className="text-5xl font-extrabold text-primary">{totalStars}</p>
          <p className="text-lg font-semibold text-muted-foreground text-center">
            {totalStars === 0
              ? "Finish your tasks to earn your first star!"
              : `You earned ${totalStars} star${totalStars === 1 ? "" : "s"}! Great job!`}
          </p>
        </div>

        {/* Streak display */}
        <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-border bg-card p-6 shadow-sm w-full max-w-sm">
          <span className="text-4xl" role="img" aria-hidden="true">
            {streak >= 3 ? "🔥" : "📅"}
          </span>
          <p className="text-3xl font-extrabold text-primary">{streak}</p>
          <p className="text-base font-semibold text-muted-foreground">
            {streak === 0
              ? "Start learning today for a streak!"
              : `${streak} day streak — keep going!`}
          </p>
        </div>

        {/* Badges */}
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-extrabold text-center mb-3">My Badges</h2>
          <div className="grid grid-cols-3 gap-3">
            {BADGES.map((badge) => {
              const earned = earnedBadges.some((b) => b.id === badge.id);
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-center",
                    earned
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 opacity-40",
                  )}
                >
                  <span className="text-3xl" aria-hidden="true">
                    {badge.emoji}
                  </span>
                  <span className="text-xs font-bold">{badge.label}</span>
                  {earned && (
                    <span className="text-xs text-primary">✓ Earned</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </KidShell>
  );
}
