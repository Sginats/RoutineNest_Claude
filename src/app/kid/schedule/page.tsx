"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import { getActiveProfileId } from "@/lib/profileStore";
import { useSettings } from "@/lib/settingsHooks";
import {
  getSchedules,
  getScheduleItems,
  getCards,
  updateScheduleItemDone,
  addRewardIfNew,
} from "@/lib/db";
import type { ScheduleItem, Card as CardType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { trackScreen, trackScheduleItemCompleted } from "@/lib/analytics";
import { KidShell } from "@/components/kid/KidShell";
import { BigTileButton } from "@/components/kid/BigTileButton";
import { EmptyState } from "@/components/kid/EmptyState";

export default function SchedulePage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [profileId] = useState(() => getActiveProfileId());

  const { data: settings } = useSettings(profileId);

  // Fetch schedules for the active profile
  const { data: schedules, isLoading: schedulesLoading } = useQuery({
    queryKey: ["schedules", profileId],
    queryFn: () => getSchedules(profileId!),
    enabled: !!profileId && !!user,
  });

  // Pick the first schedule (MVP)
  const scheduleId = schedules?.[0]?.id ?? null;

  // Fetch schedule items for the first schedule
  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ["scheduleItems", scheduleId],
    queryFn: () => getScheduleItems(scheduleId!),
    enabled: !!scheduleId,
  });

  // Fetch cards for labels and images
  const { data: cards } = useQuery({
    queryKey: ["cards", profileId],
    queryFn: () => getCards(profileId!),
    enabled: !!profileId && !!user,
  });

  // Build a lookup map: card id → card
  const cardMap = new Map<string, CardType>();
  cards?.forEach((c) => cardMap.set(c.id, c));

  // Track screen view once user and profile are ready
  useEffect(() => {
    if (user && profileId) {
      trackScreen("schedule");
    }
  }, [user, profileId]);

  // Optimistic mutation for toggling done state
  const queryClient = useQueryClient();
  const { mutate: toggleDone } = useMutation({
    mutationFn: async ({
      itemId,
      done,
      awardStar,
    }: {
      itemId: string;
      done: boolean;
      awardStar?: boolean;
    }) => {
      const result = await updateScheduleItemDone(itemId, done);
      if (awardStar && profileId) {
        await addRewardIfNew(profileId, 1, `schedule_item:${itemId}`);
      }
      if (done) {
        trackScheduleItemCompleted(itemId);
      }
      return result;
    },
    onMutate: async ({ itemId, done }) => {
      await queryClient.cancelQueries({
        queryKey: ["scheduleItems", scheduleId],
      });
      const previous = queryClient.getQueryData<ScheduleItem[]>([
        "scheduleItems",
        scheduleId,
      ]);
      queryClient.setQueryData<ScheduleItem[]>(
        ["scheduleItems", scheduleId],
        (old) =>
          old?.map((item) =>
            item.id === itemId ? { ...item, is_complete: done } : item,
          ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["scheduleItems", scheduleId],
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["scheduleItems", scheduleId],
      });
      queryClient.invalidateQueries({
        queryKey: ["rewards", profileId],
      });
    },
  });

  // Derive settings (defaults when no row exists)
  const calmMode = settings?.calm_mode ?? false;
  const gridSize = settings?.grid_size ?? 3;

  // --- Render states ---

  // Auth loading
  if (authLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading…</p>
      </div>
    );
  }

  // No profile selected
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

  // Loading schedules / items
  if (schedulesLoading || itemsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading schedule…</p>
      </div>
    );
  }

  // No schedule or no items yet
  if (!schedules?.length || !items?.length) {
    return (
      <EmptyState
        emoji="📋"
        emojiLabel="Calendar"
        title="No tasks yet!"
        description="Ask a parent to add some tasks to your schedule."
      />
    );
  }

  const gridCols =
    gridSize === 2
      ? "grid-cols-2"
      : gridSize === 4
        ? "grid-cols-4"
        : "grid-cols-3";

  const doneCount = items.filter((i) => i.is_complete).length;
  const totalCount = items.length;

  return (
    <KidShell
      title={schedules[0].title}
      emoji="📋"
      trailing={
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
          {doneCount}/{totalCount} done
        </span>
      }
    >
      {/* Progress bar */}
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={doneCount}
        aria-valuemin={0}
        aria-valuemax={totalCount}
        aria-label={`${doneCount} of ${totalCount} tasks complete`}
      >
        <div
          className="h-full rounded-full bg-success transition-all duration-300"
          style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
        />
      </div>

      <div className={cn("grid gap-4", gridCols)}>
        {items.map((item) => {
          const card = cardMap.get(item.card_id);
          return (
            <BigTileButton
              key={item.id}
              label={card?.label ?? "Task"}
              imageUrl={card?.image_url}
              fallbackEmoji={item.is_complete ? "✅" : "⭐"}
              active={item.is_complete}
              activeLabel="Done! ⭐"
              calm={calmMode}
              ariaLabel={`${card?.label ?? "Task"}, ${item.is_complete ? "done" : "not done"}`}
              ariaPressed={item.is_complete}
              onClick={() =>
                toggleDone({
                  itemId: item.id,
                  done: !item.is_complete,
                  awardStar: !item.is_complete,
                })
              }
            />
          );
        })}
      </div>
    </KidShell>
  );
}
