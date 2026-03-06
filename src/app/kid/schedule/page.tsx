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
import type { ScheduleItem as ScheduleItemType, Card as CardType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { trackScreen, trackScheduleItemCompleted } from "@/lib/analytics";
import { KidShell } from "@/components/kid/KidShell";
import { EmptyState } from "@/components/kid/EmptyState";
import { ProgressBar } from "@/components/study/ProgressBar";

export default function SchedulePage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [profileId] = useState(() => getActiveProfileId());

  const { data: settings } = useSettings(profileId);

  // Fetch all schedules for the active profile
  const { data: schedules, isLoading: schedulesLoading } = useQuery({
    queryKey: ["schedules", profileId],
    queryFn: () => getSchedules(profileId!),
    enabled: !!profileId && !!user,
  });

  // Allow switching between schedules (default to first)
  const [activeScheduleIndex, setActiveScheduleIndex] = useState(0);

  // Reset index if schedules change and index is out of bounds
  const scheduleId = schedules?.[activeScheduleIndex]?.id ?? schedules?.[0]?.id ?? null;
  const activeSchedule = schedules?.[activeScheduleIndex] ?? schedules?.[0] ?? null;

  // Fetch schedule items for the active schedule
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
  const cardMap = useMemo(() => {
    const map = new Map<string, CardType>();
    cards?.forEach((c) => map.set(c.id, c));
    return map;
  }, [cards]);

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
      const previous = queryClient.getQueryData<ScheduleItemType[]>([
        "scheduleItems",
        scheduleId,
      ]);
      queryClient.setQueryData<ScheduleItemType[]>(
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
  if (!schedules?.length) {
    return (
      <EmptyState
        emoji="📋"
        emojiLabel="Calendar"
        title="No tasks yet!"
        description="Ask a parent to add some tasks to your schedule."
      />
    );
  }

  const doneCount = items?.filter((i) => i.is_complete).length ?? 0;
  const totalCount = items?.length ?? 0;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <KidShell title={activeSchedule?.title ?? "My Schedule"} emoji="📋">
      {/* Schedule tabs — shown when more than one schedule exists */}
      {schedules.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-2 no-scrollbar"
          role="tablist"
          aria-label="Schedules"
        >
          {schedules.map((sched, idx) => (
            <button
              key={sched.id}
              type="button"
              role="tab"
              aria-selected={idx === activeScheduleIndex}
              onClick={() => setActiveScheduleIndex(idx)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-bold",
                "min-h-[44px] min-w-[44px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                calmMode ? "" : "transition-colors",
                idx === activeScheduleIndex
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground border border-border hover:bg-muted",
              )}
            >
              {sched.title}
            </button>
          ))}
        </div>
      )}

      {/* Progress card — using shared ProgressBar */}
      <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
        <div className="flex items-center justify-between pb-2">
          <span className="text-sm font-semibold text-foreground">Daily Progress</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {doneCount} of {totalCount} done
          </span>
        </div>
        <ProgressBar value={progressPercent} size="md" />
      </div>

      {/* Empty items state */}
      {(!items || items.length === 0) && (
        <EmptyState
          emoji="📝"
          emojiLabel="Note"
          title="No tasks in this schedule"
          description="Ask a parent to add some tasks."
        />
      )}

      {/* Vertical task list */}
      {items && items.length > 0 && (
        <div className={cn("flex flex-col gap-3", bigButtonMode ? "gap-4" : "")}>
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
                  "flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm border",
                  !calmMode && "transition-all active:scale-[0.98]",
                  isDone && "opacity-60",
                  isCurrent
                    ? "border-2 border-primary shadow-md"
                    : "border-border",
                  bigButtonMode && "min-h-[72px] p-5",
                )}
                aria-label={`${label}, ${isDone ? "done" : "not done"}`}
                aria-pressed={isDone}
              >
                {/* Icon area */}
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-xl",
                    isDone ? "bg-success/20" : "bg-primary/10",
                    bigButtonMode ? "h-14 w-14" : "h-12 w-12",
                  )}
                >
                  {card?.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={card.image_url}
                      alt=""
                      className={cn("rounded object-cover", bigButtonMode ? "h-10 w-10" : "h-8 w-8")}
                    />
                  ) : (
                    <span className={cn(bigButtonMode ? "text-3xl" : "text-2xl")}>
                      {isDone ? "✅" : "⭐"}
                    </span>
                  )}
                </div>

                {/* Text content */}
                <div className="flex flex-1 flex-col items-start gap-0.5">
                  <span
                    className={cn(
                      "font-bold text-foreground",
                      isDone && "line-through",
                      bigButtonMode ? "text-lg" : "text-base",
                    )}
                  >
                    {label}
                  </span>
                  {isCurrent && (
                    <span className="text-xs font-semibold text-primary">Happening Now</span>
                  )}
                </div>

                {/* Toggle checkbox */}
                <div
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-full border-2",
                    bigButtonMode ? "h-10 w-10" : "h-8 w-8",
                    isDone
                      ? "border-success bg-success text-white"
                      : "border-muted-foreground/30 bg-transparent",
                  )}
                >
                  {isDone && (
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">check</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </KidShell>
  );
}
