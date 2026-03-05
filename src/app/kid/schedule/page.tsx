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
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 px-4 text-center">
        <span className="text-7xl" role="img" aria-label="Calendar">
          📋
        </span>
        <h1 className="text-2xl font-extrabold">No tasks yet!</h1>
        <p className="text-muted-foreground text-lg">
          Ask a parent to add some tasks to your schedule.
        </p>
      </div>
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-primary">
          📋 {schedules[0].title}
        </h1>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
          {doneCount}/{totalCount} done
        </span>
      </div>

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
          className="h-full rounded-full bg-success transition-all duration-500"
          style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
        />
      </div>

      <div className={cn("grid gap-4", gridCols)}>
        {items.map((item) => {
          const card = cardMap.get(item.card_id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                toggleDone({
                  itemId: item.id,
                  done: !item.is_complete,
                  awardStar: !item.is_complete,
                })
              }
              className={cn(
                "min-h-[130px] min-w-[44px] rounded-2xl border-3 p-4",
                "flex flex-col items-center justify-center gap-3 text-center",
                "cursor-pointer select-none shadow-sm",
                "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2",
                calmMode
                  ? ""
                  : "transition-transform active:scale-95 hover:shadow-md",
                item.is_complete
                  ? "border-success bg-success/10"
                  : "border-border bg-card hover:border-primary/60",
              )}
              aria-pressed={item.is_complete}
              aria-label={`${card?.label ?? "Task"}, ${item.is_complete ? "done" : "not done"}`}
            >
              {card?.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={card.image_url}
                  alt=""
                  className="h-16 w-16 rounded-xl object-cover"
                  aria-hidden="true"
                />
              ) : (
                <span
                  className="text-4xl"
                  role="img"
                  aria-hidden="true"
                >
                  {item.is_complete ? "✅" : "⭐"}
                </span>
              )}

              <span className="text-base font-bold leading-tight">
                {card?.label ?? "Task"}
              </span>

              {item.is_complete && (
                <span className="text-sm font-bold text-success">
                  Done! ⭐
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
