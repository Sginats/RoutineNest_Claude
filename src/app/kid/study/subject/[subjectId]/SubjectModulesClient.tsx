"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useAuth";
import { getActiveProfileId } from "@/lib/profileStore";
import { useSettings } from "@/lib/settingsHooks";
import { useSubscription } from "@/lib/subscriptionHooks";
import { getChildProgress, getChildLearningPlan } from "@/lib/studyDb";
import {
  SEED_SUBJECT_AREAS,
  SEED_MODULES,
  SEED_LESSONS,
  SEED_ACTIVITIES,
  filterModulesByClassLevel,
} from "@/lib/studySeedData";
import { KidShell } from "@/components/kid/KidShell";
import { EmptyState } from "@/components/kid/EmptyState";
import { StudyTile } from "@/components/study/StudyTile";
import { ProgressBar } from "@/components/study/ProgressBar";
import { UpgradeBanner } from "@/components/UpgradeBanner";

export default function SubjectModulesClient({ subjectId }: { subjectId: string }) {
  const { user, loading: authLoading } = useRequireAuth();
  const [profileId] = useState(() => getActiveProfileId());
  const router = useRouter();

  const { data: settings } = useSettings(profileId);
  const calmMode = settings?.calm_mode ?? false;

  const { data: subscriptionTier, isLoading: subscriptionLoading } = useSubscription(user?.id);
  const isPremium = subscriptionTier === "premium";

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["childProgress", profileId],
    queryFn: () => getChildProgress(profileId!),
    enabled: !!profileId && !!user,
  });

  const { data: learningPlan } = useQuery({
    queryKey: ["childLearningPlan", profileId],
    queryFn: () => getChildLearningPlan(profileId!),
    enabled: !!profileId && !!user,
  });

  // Class level from learning plan — used for module filtering
  const classLevelId = learningPlan?.class_level_id ?? null;

  const subject = useMemo(
    () => SEED_SUBJECT_AREAS.find((s) => s.id === subjectId),
    [subjectId],
  );

  const modules = useMemo(() => {
    const allSubjectModules = SEED_MODULES.filter(
      (m) => m.subject_area_id === subjectId,
    ).sort((a, b) => a.order - b.order);
    // Apply class-level filtering; fall back to all if none match
    const filtered = filterModulesByClassLevel(allSubjectModules, classLevelId);
    return filtered.length > 0 ? filtered : allSubjectModules;
  }, [subjectId, classLevelId]);

  // Compute progress per module
  const moduleProgress = useMemo(() => {
    const map = new Map<string, number>();
    if (!progress?.length) return map;

    const completedActivityIds = new Set(
      progress.filter((p) => p.completed).map((p) => p.activity_id),
    );

    for (const mod of modules) {
      const lessons = SEED_LESSONS.filter((l) => l.module_id === mod.id);
      const lessonIds = new Set(lessons.map((l) => l.id));
      const activities = SEED_ACTIVITIES.filter((a) =>
        lessonIds.has(a.lesson_id),
      );

      if (activities.length === 0) {
        map.set(mod.id, 0);
        continue;
      }

      const completed = activities.filter((a) =>
        completedActivityIds.has(a.id),
      ).length;
      map.set(mod.id, Math.round((completed / activities.length) * 100));
    }
    return map;
  }, [modules, progress]);

  // Count lessons per module
  const moduleLessonCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const mod of modules) {
      map.set(
        mod.id,
        SEED_LESSONS.filter((l) => l.module_id === mod.id).length,
      );
    }
    return map;
  }, [modules]);

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

  if (progressLoading || subscriptionLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading modules…</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <EmptyState
        emoji="🔍"
        emojiLabel="Magnifying glass"
        title="Subject not found"
        description="We couldn't find that subject. Try going back to your study plan."
      />
    );
  }

  // Gate premium subjects for free users
  if (subject.is_premium && !isPremium) {
    return (
      <KidShell title={subject.title} emoji={subject.icon}>
        <Link
          href="/kid/study"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          ← Back to Study Plan
        </Link>
        <UpgradeBanner
          heading={`${subject.title} — Premium`}
          description="This subject is part of the Premium curriculum. Ask a parent to upgrade to unlock all subjects, modules, and lessons."
          calm={calmMode}
        />
      </KidShell>
    );
  }

  // Calculate overall subject progress
  const overallProgress =
    modules.length > 0
      ? Math.round(
          modules.reduce(
            (sum, m) => sum + (moduleProgress.get(m.id) ?? 0),
            0,
          ) / modules.length,
        )
      : 0;

  return (
    <KidShell title={subject.title} emoji={subject.icon}>
      <Link
        href="/kid/study"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        ← Back to Study Plan
      </Link>

      <div className="px-1">
        <ProgressBar
          value={overallProgress}
          label={`${subject.title} Progress`}
          showPercent
          size="md"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {modules.map((mod, i) => (
          <StudyTile
            key={mod.id}
            title={mod.title}
            icon={mod.icon}
            description={`${moduleLessonCounts.get(mod.id) ?? 0} lessons`}
            progress={moduleProgress.get(mod.id) ?? 0}
            locked={mod.is_premium && !isPremium}
            index={i}
            calm={calmMode}
            onClick={() => router.push(`/kid/study/module/${mod.id}`)}
          />
        ))}
      </div>

      {modules.length === 0 && (
        <EmptyState
          emoji="📦"
          emojiLabel="Package"
          title="No modules yet"
          description="This subject doesn't have any modules yet. Check back soon!"
        />
      )}
    </KidShell>
  );
}
