"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import { getActiveProfileId } from "@/lib/profileStore";
import { getRewards } from "@/lib/db";

export default function RewardsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [profileId] = useState(() => getActiveProfileId());

  const { data: rewards, isLoading } = useQuery({
    queryKey: ["rewards", profileId],
    queryFn: () => getRewards(profileId!),
    enabled: !!profileId && !!user,
  });

  const totalStars = rewards?.reduce((sum, r) => sum + r.stars, 0) ?? 0;

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!profileId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 px-4 text-center">
        <span className="text-7xl" role="img" aria-label="House">
          🏠
        </span>
        <h1 className="text-2xl font-extrabold">
          Ask a parent to set up RoutineNest
        </h1>
        <p className="text-muted-foreground text-lg">
          A grown-up needs to create your profile first.
        </p>
      </div>
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
    <div className="flex flex-col items-center gap-8 pt-8">
      <h1 className="text-3xl font-extrabold text-primary">
        ⭐ My Stars
      </h1>

      <div className="flex flex-col items-center gap-6 rounded-3xl border-2 border-border bg-card p-8 shadow-sm w-full max-w-sm">
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
  );
}
