"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, upsertSettings } from "@/lib/db";
import type { Settings, SettingsPatch } from "@/lib/types";

const SETTINGS_KEY = "settings";

/**
 * Fetch settings for a profile. Returns null when no settings row exists yet.
 */
export function useSettings(profileId: string | null) {
  return useQuery<Settings | null>({
    queryKey: [SETTINGS_KEY, profileId],
    queryFn: () => {
      if (!profileId) return null;
      return getSettings(profileId);
    },
    enabled: !!profileId,
  });
}

interface MutationContext {
  previous: Settings | null | undefined;
}

/**
 * Optimistic mutation that patches settings and writes to Supabase.
 */
export function useUpdateSettings(profileId: string | null) {
  const queryClient = useQueryClient();

  return useMutation<Settings, Error, SettingsPatch, MutationContext>({
    mutationFn: (patch: SettingsPatch) => {
      if (!profileId) throw new Error("No profile selected");
      return upsertSettings(profileId, patch);
    },

    onMutate: async (patch) => {
      if (!profileId) return { previous: undefined };

      await queryClient.cancelQueries({
        queryKey: [SETTINGS_KEY, profileId],
      });

      const previous = queryClient.getQueryData<Settings | null>([
        SETTINGS_KEY,
        profileId,
      ]);

      queryClient.setQueryData<Settings | null>(
        [SETTINGS_KEY, profileId],
        (old) => {
          if (!old) {
            // Create an optimistic placeholder
            return {
              id: "",
              profile_id: profileId,
              calm_mode: false,
              big_button_mode: false,
              parent_lock_enabled: true,
              grid_size: 3,
              sound_enabled: true,
              created_at: "",
              updated_at: "",
              ...patch,
            } as Settings;
          }
          return { ...old, ...patch };
        },
      );

      return { previous };
    },

    onError: (_err, _patch, context) => {
      if (context?.previous !== undefined && profileId) {
        queryClient.setQueryData(
          [SETTINGS_KEY, profileId],
          context.previous,
        );
      }
    },

    onSettled: () => {
      if (profileId) {
        queryClient.invalidateQueries({
          queryKey: [SETTINGS_KEY, profileId],
        });
      }
    },
  });
}
