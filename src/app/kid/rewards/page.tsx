"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import { getActiveProfileId } from "@/lib/profileStore";
import { getRewards } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!profileId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 px-4 text-center">
        <span className="text-6xl" role="img" aria-label="House">
          🏠
        </span>
        <h1 className="text-2xl font-bold">
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
        <p className="text-muted-foreground">Loading rewards…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold">My Rewards</h1>

      <Card>
        <CardHeader>
          <CardTitle>Stars Earned</CardTitle>
          <CardDescription>
            Complete tasks to earn stars!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-6xl">⭐ {totalStars}</p>
          <p className="text-muted-foreground">
            {totalStars === 0
              ? "Finish your routine to earn your first star!"
              : `You have earned ${totalStars} star${totalStars === 1 ? "" : "s"}!`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
