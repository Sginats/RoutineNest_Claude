"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import { getActiveProfileId } from "@/lib/profileStore";
import { useSettings } from "@/lib/settingsHooks";
import { getRewards } from "@/lib/db";
import { KidShell } from "@/components/kid/KidShell";
import { EmptyState } from "@/components/kid/EmptyState";

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

  const totalStars = rewards?.reduce((sum, r) => sum + r.stars, 0) ?? 0;

  // Track previous star count for celebration
  const [prevStars, setPrevStars] = useState(totalStars);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (totalStars > prevStars && !calmMode) {
      // Use a microtask so setState is not called synchronously in the effect body
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
      <div className="flex justify-center">
        <div className="relative flex flex-col items-center gap-6 rounded-3xl border-2 border-border bg-card p-8 shadow-sm w-full max-w-sm">
          {/* Gentle celebration overlay — only if calm mode is OFF */}
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
      </div>
    </KidShell>
  );
}
