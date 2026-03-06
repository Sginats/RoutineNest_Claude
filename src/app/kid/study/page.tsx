"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useAuth";
import { getActiveProfileId } from "@/lib/profileStore";
import { useSettings } from "@/lib/settingsHooks";
import { getChildLearningPlan, getChildProgress, getWeeklyPlanEntries } from "@/lib/studyDb";
import {
  SEED_SUBJECT_AREAS,
  SEED_MODULES,
  SEED_LESSONS,
  SEED_ACTIVITIES,
} from "@/lib/studySeedData";
import type { DayOfWeek } from "@/lib/studyTypes";
import { KidShell } from "@/components/kid/KidShell";
import { EmptyState } from "@/components/kid/EmptyState";
import { StudyTile } from "@/components/study/StudyTile";
import { BreakCard } from "@/components/study/BreakCard";

const DAY_NAMES: DayOfWeek[] = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
];

function getTodayDayName(): DayOfWeek {
  return DAY_NAMES[new Date().getDay()];
}

export default function StudyHomePage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [profileId] = useState(() => getActiveProfileId());
  const router = useRouter();

  const { data: settings } = useSettings(profileId);
  const calmMode = settings?.calm_mode ?? false;

  const { data: learningPlan, isLoading: planLoading } = useQuery({
    queryKey: ["childLearningPlan", profileId],
    queryFn: () => getChildLearningPlan(profileId!),
    enabled: !!profileId && !!user,
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["childProgress", profileId],
    queryFn: () => getChildProgress(profileId!),
    enabled: !!profileId && !!user,
  });

  const { data: weeklyEntries } = useQuery({
    queryKey: ["weeklyPlanEntries", learningPlan?.id],
    queryFn: () => getWeeklyPlanEntries(learningPlan!.id),
    enabled: !!learningPlan?.id,
  });

  // Get today's subjects from weekly plan (if configured)
  const todaySubjectIds = useMemo(() => {
    if (!weeklyEntries?.length) return null; // null = no weekly plan, show all
    const today = getTodayDayName();
    const todayEntries = weeklyEntries.filter((e) => e.day === today);
    if (todayEntries.length === 0) return null; // no entries for today, show all
    return todayEntries.map((e) => e.subject_area_id);
  }, [weeklyEntries]);

  // Determine which subjects to show: today's plan > learning plan > fallback
  const subjects = useMemo(() => {
    let base = SEED_SUBJECT_AREAS;

    if (learningPlan?.subject_area_ids?.length) {
      base = SEED_SUBJECT_AREAS.filter((s) =>
        learningPlan.subject_area_ids.includes(s.id),
      );
    } else {
      base = SEED_SUBJECT_AREAS.filter((s) => !s.is_premium);
    }

    // If today's weekly plan has specific subjects, filter further
    if (todaySubjectIds) {
      base = base.filter((s) => todaySubjectIds.includes(s.id));
    }

    return base.sort((a, b) => a.order - b.order);
  }, [learningPlan, todaySubjectIds]);

  // Compute progress percentage per subject
  const subjectProgress = useMemo(() => {
    const map = new Map<string, number>();
    if (!progress?.length) return map;

    const completedActivityIds = new Set(
      progress.filter((p) => p.completed).map((p) => p.activity_id),
    );

    for (const subject of subjects) {
      const modules = SEED_MODULES.filter(
        (m) => m.subject_area_id === subject.id,
      );
      const moduleIds = new Set(modules.map((m) => m.id));
      const lessons = SEED_LESSONS.filter((l) => moduleIds.has(l.module_id));
      const lessonIds = new Set(lessons.map((l) => l.id));
      const activities = SEED_ACTIVITIES.filter((a) =>
        lessonIds.has(a.lesson_id),
      );

      if (activities.length === 0) {
        map.set(subject.id, 0);
        continue;
      }

      const completed = activities.filter((a) =>
        completedActivityIds.has(a.id),
      ).length;
      map.set(subject.id, Math.round((completed / activities.length) * 100));
    }
    return map;
  }, [subjects, progress]);

  const allComplete =
    subjects.length > 0 &&
    subjects.every((s) => (subjectProgress.get(s.id) ?? 0) === 100);

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

  if (planLoading || progressLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading study plan…</p>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <EmptyState
        emoji="📚"
        emojiLabel="Books"
        title="Ask a parent to set up your study plan!"
        description="Once your learning plan is ready, your subjects will appear here."
      />
    );
  }

  // Build items list with break cards inserted every 2–3 subjects
  const tilesWithBreaks: React.ReactNode[] = [];
  subjects.forEach((subject, i) => {
    tilesWithBreaks.push(
      <StudyTile
        key={subject.id}
        title={subject.title}
        icon={subject.icon}
        description={subject.description}
        progress={subjectProgress.get(subject.id) ?? 0}
        locked={subject.is_premium}
        index={i}
        calm={calmMode}
        onClick={() => router.push(`/kid/study/subject/${subject.id}`)}
      />,
    );
    // Insert a break card after every 3rd subject (but not after the last one)
    if ((i + 1) % 3 === 0 && i < subjects.length - 1) {
      tilesWithBreaks.push(
        <div key={`break-${i}`} className="col-span-full">
          <BreakCard calm={calmMode} />
        </div>,
      );
    }
  });

  return (
    <KidShell title="Today's Plan" emoji="📚">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {tilesWithBreaks}
      </div>

      {allComplete && (
        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <span className="text-5xl" role="img" aria-label="Celebration">
            🎉
          </span>
          <p className="text-2xl font-extrabold text-primary">All Done!</p>
          <p className="text-lg text-muted-foreground">
            Amazing work today — you finished everything!
          </p>
        </div>
      )}
    </KidShell>
  );
}
