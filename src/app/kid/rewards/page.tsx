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
  { id: "first-star", icon: "stars", label: "First Star", threshold: 1, color: "amber" },
  { id: "five-stars", icon: "auto_awesome", label: "Rising Star", threshold: 5, color: "purple" },
  { id: "ten-stars", icon: "star", label: "Super Star", threshold: 10, color: "blue" },
  { id: "twenty-five-stars", icon: "military_tech", label: "Star Collector", threshold: 25, color: "orange" },
  { id: "fifty-stars", icon: "emoji_events", label: "Champion", threshold: 50, color: "green" },
  { id: "streak-3", icon: "local_fire_department", label: "3 Day Streak", threshold: -3, color: "red" },
  { id: "streak-7", icon: "bolt", label: "7 Day Streak", threshold: -7, color: "indigo" },
] as const;

const BADGE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  amber:  { bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-200 dark:border-amber-800", text: "text-amber-500" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-200 dark:border-purple-800", text: "text-purple-500" },
  blue:   { bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-200 dark:border-blue-800", text: "text-blue-500" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/30", border: "border-orange-200 dark:border-orange-800", text: "text-orange-500" },
  green:  { bg: "bg-green-100 dark:bg-green-900/30", border: "border-green-200 dark:border-green-800", text: "text-green-500" },
  red:    { bg: "bg-red-100 dark:bg-red-900/30", border: "border-red-200 dark:border-red-800", text: "text-red-500" },
  indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/30", border: "border-indigo-200 dark:border-indigo-800", text: "text-indigo-500" },
};

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

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

  // Stars earned today
  const todayStars = useMemo(() => {
    const today = toLocalDateStr(new Date().toISOString());
    return (rewards ?? [])
      .filter((r) => toLocalDateStr(r.created_at) === today)
      .reduce((sum, r) => sum + r.stars, 0);
  }, [rewards]);

  // Which weekdays (0=Mon..4=Fri) had completed activity this week
  const streakDays = useMemo(() => {
    const now = new Date();
    const jsDay = now.getDay(); // 0=Sun
    const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const activeDates = new Set(
      (progress ?? [])
        .filter((p) => p.completed && p.completed_at)
        .map((p) => toLocalDateStr(p.completed_at!)),
    );

    const days = new Set<number>();
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      if (activeDates.has(toLocalDateStr(d.toISOString()))) days.add(i);
    }
    return days;
  }, [progress]);

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
    <KidShell title="My Rewards" emoji="⭐">
      <div className="flex flex-col items-center gap-6">
        {/* Central Star Counter */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-star-yellow/20 blur-3xl rounded-full" />
            <span
              className="material-symbols-outlined text-star-yellow text-[120px] drop-shadow-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              stars
            </span>
          </div>

          {showCelebration && (
            <div
              className="absolute inset-0 flex items-center justify-center animate-pulse"
              aria-live="polite"
            >
              <span className="text-5xl">🎉</span>
            </div>
          )}

          <p
            className="mt-4 text-5xl font-extrabold tracking-tight text-foreground"
            aria-label={`${totalStars} stars`}
          >
            {totalStars}
          </p>
          <p className="text-lg font-bold text-muted-foreground uppercase tracking-widest">
            Total Stars
          </p>

          {todayStars > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-bold text-sm">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                trending_up
              </span>
              <span>+{todayStars} today</span>
            </div>
          )}
        </div>

        {/* Daily Streak */}
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-extrabold">Daily Streak</h3>
            <span className="text-star-yellow font-bold">
              {streak > 0
                ? `${streak} Day${streak === 1 ? "" : "s"}! 🔥`
                : "Start today!"}
            </span>
          </div>
          <div className="flex justify-between gap-2 bg-white/60 dark:bg-card/60 backdrop-blur-sm p-4 rounded-xl border-2 border-white dark:border-border shadow-sm">
            {WEEK_DAYS.map((day, i) => {
              const active = streakDays.has(i);
              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">
                    {day}
                  </span>
                  <div
                    className={cn(
                      "size-10 rounded-full flex items-center justify-center",
                      active
                        ? "bg-star-yellow"
                        : "bg-muted/40 border-2 border-border",
                    )}
                  >
                    {active && (
                      <span className="material-symbols-outlined text-white font-bold" aria-hidden="true">
                        check
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Badges — horizontal scroll */}
        <div className="w-full">
          <h3 className="text-xl font-extrabold px-1 mb-4">My Badges</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {BADGES.map((badge) => {
              const earned = earnedBadges.some((b) => b.id === badge.id);
              const palette = BADGE_COLORS[badge.color];
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "flex flex-col items-center gap-2 min-w-[100px]",
                    !earned && "opacity-40",
                  )}
                >
                  <div
                    className={cn(
                      "size-20 rounded-full flex items-center justify-center border-4 shadow-sm",
                      earned
                        ? `${palette.bg} ${palette.border}`
                        : "bg-muted dark:bg-muted/30 border-border",
                    )}
                  >
                    <span
                      className={cn(
                        "material-symbols-outlined text-4xl",
                        earned ? palette.text : "text-muted-foreground",
                      )}
                      aria-hidden="true"
                    >
                      {earned ? badge.icon : "lock"}
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-center">
                    {earned ? badge.label : "???"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </KidShell>
  );
}
