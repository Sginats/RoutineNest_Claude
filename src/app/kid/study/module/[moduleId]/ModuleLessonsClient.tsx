"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useAuth";
import { getActiveProfileId } from "@/lib/profileStore";
import { useSettings } from "@/lib/settingsHooks";
import { getChildProgress } from "@/lib/studyDb";
import {
  SEED_MODULES,
  SEED_LESSONS,
  SEED_ACTIVITIES,
  SEED_SUBJECT_AREAS,
} from "@/lib/studySeedData";
import { KidShell } from "@/components/kid/KidShell";
import { EmptyState } from "@/components/kid/EmptyState";
import { LessonCard } from "@/components/study/LessonCard";
import { ProgressBar } from "@/components/study/ProgressBar";

export default function ModuleLessonsClient({ moduleId }: { moduleId: string }) {
  const { user, loading: authLoading } = useRequireAuth();
  const [profileId] = useState(() => getActiveProfileId());
  const router = useRouter();

  const { data: settings } = useSettings(profileId);
  const calmMode = settings?.calm_mode ?? false;

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["childProgress", profileId],
    queryFn: () => getChildProgress(profileId!),
    enabled: !!profileId && !!user,
  });

  const mod = useMemo(
    () => SEED_MODULES.find((m) => m.id === moduleId),
    [moduleId],
  );

  const subject = useMemo(
    () => SEED_SUBJECT_AREAS.find((s) => s.id === mod?.subject_area_id),
    [mod],
  );

  const lessons = useMemo(
    () =>
      SEED_LESSONS.filter((l) => l.module_id === moduleId).sort(
        (a, b) => a.order - b.order,
      ),
    [moduleId],
  );

  // Determine which lessons are completed
  const lessonCompletion = useMemo(() => {
    const map = new Map<string, boolean>();
    if (!progress?.length) return map;

    const completedActivityIds = new Set(
      progress.filter((p) => p.completed).map((p) => p.activity_id),
    );

    for (const lesson of lessons) {
      const activities = SEED_ACTIVITIES.filter(
        (a) => a.lesson_id === lesson.id,
      );
      if (activities.length === 0) {
        map.set(lesson.id, false);
        continue;
      }
      const allDone = activities.every((a) => completedActivityIds.has(a.id));
      map.set(lesson.id, allDone);
    }
    return map;
  }, [lessons, progress]);

  const completedCount = Array.from(lessonCompletion.values()).filter(
    Boolean,
  ).length;
  const overallProgress =
    lessons.length > 0
      ? Math.round((completedCount / lessons.length) * 100)
      : 0;

  // --- Render states ---

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading…</p>
      </div>
    );
  }

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

  if (progressLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading lessons…</p>
      </div>
    );
  }

  if (!mod) {
    return (
      <EmptyState
        emoji="🔍"
        emojiLabel="Magnifying glass"
        title="Module not found"
        description="We couldn't find that module. Try going back to your subjects."
      />
    );
  }

  return (
    <KidShell title={mod.title} emoji={mod.icon}>
      <Link
        href={
          subject
            ? `/kid/study/subject/${subject.id}`
            : "/kid/study"
        }
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        ← Back to {subject?.title ?? "Subjects"}
      </Link>

      <div className="px-1">
        <ProgressBar
          value={overallProgress}
          label={`${completedCount} of ${lessons.length} lessons complete`}
          showPercent
          size="md"
        />
      </div>

      <div className="flex flex-col gap-3">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            title={lesson.title}
            icon={lesson.icon}
            description={lesson.description}
            duration_minutes={lesson.duration_minutes}
            reward_points={lesson.reward_points}
            completed={lessonCompletion.get(lesson.id) ?? false}
            locked={lesson.is_premium}
            calm={calmMode}
            onClick={() => router.push(`/kid/study/lesson/${lesson.id}`)}
          />
        ))}
      </div>

      {lessons.length === 0 && (
        <EmptyState
          emoji="📄"
          emojiLabel="Page"
          title="No lessons yet"
          description="This module doesn't have any lessons yet. Check back soon!"
        />
      )}
    </KidShell>
  );
}
