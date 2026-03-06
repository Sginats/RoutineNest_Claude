// RoutineNest — Subscription hooks
// Provides React Query hooks for reading and mutating the subscription tier.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateSubscriptionTier } from "./db";
import type { SubscriptionTier } from "./types";

/**
 * Returns the current subscription tier for the given user.
 * Defaults to 'free' when no profile row is found.
 */
export function useSubscription(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["subscription", userId],
    queryFn: async () => {
      if (!userId) return "free" as SubscriptionTier;
      const profile = await getProfile(userId);
      return (profile?.subscription_tier ?? "free") as SubscriptionTier;
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}

/** Returns true when the user has an active premium subscription. */
export function useIsPremium(userId: string | null | undefined): boolean {
  const { data } = useSubscription(userId);
  return data === "premium";
}

/** Mutation to update the subscription tier for the given user. */
export function useUpdateSubscription(userId: string | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tier: SubscriptionTier) => {
      if (!userId) throw new Error("No user ID");
      return updateSubscriptionTier(userId, tier);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", userId] });
      // Also invalidate the profiles list so parent dashboard refreshes
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}
