"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import ParentGate from "@/components/ParentGate";
import { getActiveProfileId } from "@/lib/profileStore";
import { getSchedules, getScheduleItems } from "@/lib/db";
import type { Schedule, ScheduleItem } from "@/lib/types";
import { cn } from "@/lib/utils";


function formatTime(position: number): string {
  const hour = 7 + position;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
}

function getIconForItem(item: ScheduleItem, index: number): string {
  const icons = ["sunny", "restaurant", "school", "menu_book", "lunch_dining", "sports_esports", "bathtub", "bedtime"];
  return icons[index % icons.length];
}

function getTitleForItem(item: ScheduleItem, index: number): string {
  return `Routine Item ${index + 1}`;
}

// ── Schedule Item Row ─────────────────────────────────────────────────────────

function ScheduleItemRow({
  item,
  index,
}: {
  item: ScheduleItem;
  index: number;
}) {
  const icon = getIconForItem(item, index);
  const title = getTitleForItem(item, index);
  const time = formatTime(item.position);

  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-white p-4 min-h-[80px]">
      {/* Drag handle */}
      <span
        className="material-symbols-outlined text-slate-300 text-xl cursor-grab"
        aria-hidden="true"
      >
        drag_indicator
      </span>

      {/* Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <span className="material-symbols-outlined text-primary text-2xl">
          {icon}
        </span>
      </div>

      {/* Title & time */}
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-base font-semibold text-foreground">{title}</span>
        <span className="text-sm text-slate-400">{time}</span>
      </div>

      {/* Status indicator */}
      {item.is_complete && (
        <span className="material-symbols-outlined text-green-500 text-xl">
          check_circle
        </span>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ScheduleBuilderPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [profileId] = useState(() => getActiveProfileId());

  // Fetch schedules for this profile
  const { data: schedules = [], isLoading: schedulesLoading } = useQuery<
    Schedule[]
  >({
    queryKey: ["schedules", profileId],
    queryFn: () => {
      if (!profileId) return [];
      return getSchedules(profileId);
    },
    enabled: !!profileId,
  });

  const firstSchedule = schedules[0] ?? null;

  // Fetch items for the first schedule
  const { data: items = [], isLoading: itemsLoading } = useQuery<
    ScheduleItem[]
  >({
    queryKey: ["schedule_items", firstSchedule?.id],
    queryFn: () => {
      if (!firstSchedule) return [];
      return getScheduleItems(firstSchedule.id);
    },
    enabled: !!firstSchedule,
  });

  const isLoading = authLoading || schedulesLoading || itemsLoading;

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!profileId) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold text-primary">
          📋 Schedule Builder
        </h1>
        <div className="rounded-2xl border bg-white p-8 text-center">
          <p className="text-muted-foreground">
            No profile selected. Please go to the{" "}
            <a
              href="/parent"
              className="font-semibold text-primary underline"
            >
              Parent Dashboard
            </a>{" "}
            and select a child profile first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ParentGate>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <Link
            href="/parent"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-primary">
            📋 Schedule Builder
          </h1>
          <p className="text-muted-foreground">
            Build and reorder your child&apos;s daily routine.
          </p>
        </div>

        {/* Schedule title */}
        {firstSchedule && (
          <div className="rounded-2xl border bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Current Schedule
            </p>
            <p className="text-lg font-bold text-foreground">
              {firstSchedule.title}
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex min-h-[30vh] items-center justify-center">
            <p className="text-lg text-muted-foreground">
              Loading schedule…
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border bg-white py-12 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300">
              event_note
            </span>
            <div>
              <p className="text-lg font-semibold text-foreground">
                No routine items yet
              </p>
              <p className="text-sm text-muted-foreground">
                Tap the button below to add your first routine item.
              </p>
            </div>
          </div>
        )}

        {/* Schedule items list */}
        {!isLoading && items.length > 0 && (
          <div className="flex flex-col gap-3">
            {items.map((item, index) => (
              <ScheduleItemRow key={item.id} item={item} index={index} />
            ))}
          </div>
        )}

        {/* Add Routine Item button */}
        {!isLoading && (
          <button
            type="button"
            className={cn(
              "flex min-h-[72px] items-center justify-center gap-2 rounded-2xl",
              "border-2 border-dashed border-slate-300 bg-white",
              "text-base font-semibold text-slate-400",
              "transition-colors hover:border-primary/40 hover:text-primary/60",
            )}
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Add Routine Item
          </button>
        )}
      </div>
    </ParentGate>
  );
}
