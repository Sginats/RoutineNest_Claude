"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import { getActiveProfileId } from "@/lib/profileStore";
import { useSettings } from "@/lib/settingsHooks";
import {
  getSchedules,
  getScheduleItems,
  getCards,
  updateScheduleItemDone,
} from "@/lib/db";
import type { ScheduleItem, Card as CardType } from "@/lib/types";
import { cn } from "@/lib/utils";

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

  // Optimistic mutation for toggling done state
  const queryClient = useQueryClient();
  const { mutate: toggleDone } = useMutation({
    mutationFn: ({ itemId, done }: { itemId: string; done: boolean }) =>
      updateScheduleItemDone(itemId, done),
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
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  // No profile selected
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

  // Loading schedules / items
  if (schedulesLoading || itemsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading schedule…</p>
      </div>
    );
  }

  // No schedule or no items yet
  if (!schedules?.length || !items?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 px-4 text-center">
        <span className="text-6xl" role="img" aria-label="Calendar">
          📅
        </span>
        <h1 className="text-2xl font-bold">No tasks yet!</h1>
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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">{schedules[0].title}</h1>

      <div className={cn("grid gap-4", gridCols)}>
        {items.map((item) => {
          const card = cardMap.get(item.card_id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                toggleDone({ itemId: item.id, done: !item.is_complete })
              }
              className={cn(
                "min-h-[120px] min-w-[44px] rounded-2xl border-2 p-4",
                "flex flex-col items-center justify-center gap-3 text-center",
                "cursor-pointer select-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                calmMode ? "" : "transition-transform active:scale-95",
                item.is_complete
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : "border-border bg-card hover:border-primary",
              )}
              aria-pressed={item.is_complete}
              aria-label={`${card?.label ?? "Task"}, ${item.is_complete ? "done" : "not done"}`}
            >
              {card?.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={card.image_url}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover"
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

              <span className="text-base font-semibold leading-tight">
                {card?.label ?? "Task"}
              </span>

              {item.is_complete && (
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Done!
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
