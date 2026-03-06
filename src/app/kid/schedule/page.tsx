"use client";

import { useState, useEffect, useMemo } from "react";
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
  const bigButtonMode = settings?.big_button_mode ?? false;

  // Find the first incomplete item index for "Happening Now" highlight
  const firstIncompleteIdx = useMemo(
    () => items?.findIndex((i) => !i.is_complete) ?? -1,
    [items],
  );

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

  const doneCount = items.filter((i) => i.is_complete).length;
  const totalCount = items.length;

  return (
    <KidShell title={schedules[0].title} emoji="📋">
      {/* Progress card */}
      <div className="rounded-xl bg-white p-4 shadow">
        <div className="flex items-center justify-between pb-2">
          <span className="text-sm font-semibold text-foreground">Daily Progress</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {doneCount} of {totalCount} done
          </span>
        </div>
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
      </div>

      {/* Vertical task list */}
      <div className="flex flex-col gap-3">
        {items.map((item, idx) => {
          const card = cardMap.get(item.card_id);
          const label = card?.label ?? "Task";
          const isCurrent = idx === firstIncompleteIdx;
          const isDone = item.is_complete;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                toggleDone({
                  itemId: item.id,
                  done: !isDone,
                  awardStar: !isDone,
                })
              }
              className={cn(
                "flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm",
                !calmMode && "transition-all active:scale-[0.98]",
                isDone && "opacity-60",
                isCurrent && "border-2 border-primary shadow-lg",
                bigButtonMode && "min-h-[72px] p-5",
              )}
              aria-label={`${label}, ${isDone ? "done" : "not done"}`}
              aria-pressed={isDone}
            >
              {/* Icon area */}
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
                  isDone ? "bg-success/20" : "bg-primary/10",
                  bigButtonMode && "h-14 w-14",
                )}
              >
                {card?.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={card.image_url}
                    alt=""
                    className={cn("h-8 w-8 rounded object-cover", bigButtonMode && "h-10 w-10")}
                  />
                ) : (
                  <span className={cn("text-2xl", bigButtonMode && "text-3xl")}>
                    {isDone ? "✅" : "⭐"}
                  </span>
                )}
              </div>

              {/* Text content */}
              <div className="flex flex-1 flex-col items-start gap-0.5">
                <span
                  className={cn(
                    "text-base font-semibold text-foreground",
                    isDone && "line-through",
                    bigButtonMode && "text-lg",
                  )}
                >
                  {label}
                </span>
                {isCurrent && (
                  <span className="text-xs font-medium text-primary">Happening Now</span>
                )}
              </div>

              {/* Toggle checkbox */}
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
                  isDone
                    ? "border-success bg-success text-white"
                    : "border-muted-foreground/30 bg-transparent",
                )}
              >
                {isDone && (
                  <span className="material-symbols-outlined text-lg">check</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </KidShell>
  );
}
