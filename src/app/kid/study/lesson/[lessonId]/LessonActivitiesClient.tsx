"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useAuth";
import { getActiveProfileId } from "@/lib/profileStore";
import { useSettings } from "@/lib/settingsHooks";
import { useSubscription } from "@/lib/subscriptionHooks";
import { getChildProgress, upsertChildProgress } from "@/lib/studyDb";
import { addRewardIfNew } from "@/lib/db";
import {
  SEED_LESSONS,
  SEED_ACTIVITIES,
  SEED_MODULES,
} from "@/lib/studySeedData";
import { getActivityGameplayData } from "@/lib/activityGameplayData";
import { KidShell } from "@/components/kid/KidShell";
import { EmptyState } from "@/components/kid/EmptyState";
import { ProgressBar } from "@/components/study/ProgressBar";
import { RewardStars } from "@/components/study/RewardStars";
import { SubjectBadge } from "@/components/study/SubjectBadge";
import { BreakCard } from "@/components/study/BreakCard";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import {
  TapCorrectActivity,
  VisualMatchingActivity,
  SequencingActivity,
  ListenChooseActivity,
  SpeakTapAacActivity,
} from "@/components/activities";
import { cn } from "@/lib/utils";

export default function LessonActivitiesClient({ lessonId }: { lessonId: string }) {
  const { user, loading: authLoading } = useRequireAuth();
  const [profileId] = useState(() => getActiveProfileId());
  const queryClient = useQueryClient();

  const { data: settings } = useSettings(profileId);
  const calmMode = settings?.calm_mode ?? false;
  const soundEnabled = settings?.sound_enabled ?? true;

  const { data: subscriptionTier, isLoading: subscriptionLoading } = useSubscription(user?.id);
  const isPremium = subscriptionTier === "premium";

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["childProgress", profileId],
    queryFn: () => getChildProgress(profileId!),
    enabled: !!profileId && !!user,
  });

  const lesson = useMemo(
    () => SEED_LESSONS.find((l) => l.id === lessonId),
    [lessonId],
  );

  const mod = useMemo(
    () => SEED_MODULES.find((m) => m.id === lesson?.module_id),
    [lesson],
  );

  const activities = useMemo(
    () =>
      SEED_ACTIVITIES.filter((a) => a.lesson_id === lessonId).sort(
        (a, b) => a.order - b.order,
      ),
    [lessonId],
  );

  // Track which activities are already completed from DB
  const completedActivityIds = useMemo(() => {
    if (!progress?.length) return new Set<string>();
    return new Set(
      progress.filter((p) => p.completed).map((p) => p.activity_id),
    );
  }, [progress]);

  // Local state for current activity index & UI states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showBreak, setShowBreak] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  // Track locally completed activities to update UI before DB round-trip
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(new Set());

  // On initial load, skip to first incomplete activity
  useEffect(() => {
    if (activities.length > 0 && completedActivityIds.size > 0) {
      const firstIncomplete = activities.findIndex(
        (a) => !completedActivityIds.has(a.id),
      );
      if (firstIncomplete === -1) {
        // All activities already complete — defer setState to avoid cascading renders
        const completionTimer = setTimeout(() => {
          setLessonComplete(true);
          setEarnedStars(
            activities.reduce((sum, a) => sum + a.reward_points, 0),
          );
        }, 0);
        return () => clearTimeout(completionTimer);
      } else {
        const skipTimer = setTimeout(() => setCurrentIndex(firstIncomplete), 0);
        return () => clearTimeout(skipTimer);
      }
    }
  }, [activities, completedActivityIds]);

  // Mutation to save progress + award stars
  const { mutate: completeActivity, isPending } = useMutation({
    mutationFn: async (activityId: string) => {
      const activity = activities.find((a) => a.id === activityId);
      if (!activity || !profileId || !lesson || !mod) return;

      await upsertChildProgress({
        profile_id: profileId,
        activity_id: activityId,
        lesson_id: lesson.id,
        module_id: mod.id,
        completed: true,
        score: null,
        attempts: 1,
        last_attempted_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });

      if (activity.reward_points > 0) {
        await addRewardIfNew(
          profileId,
          activity.reward_points,
          `study_activity:${activityId}`,
        );
      }
    },
    onSuccess: (_data, activityId) => {
      const activity = activities.find((a) => a.id === activityId);
      const points = activity?.reward_points ?? 0;
      setEarnedStars((prev) => prev + points);
      setLocalCompleted((prev) => new Set(prev).add(activityId));

      queryClient.invalidateQueries({
        queryKey: ["childProgress", profileId],
      });
      queryClient.invalidateQueries({ queryKey: ["rewards", profileId] });

      // Show celebration (unless calm mode)
      if (!calmMode) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 1500);
      }

      // Advance to next activity or mark lesson complete
      setTimeout(
        () => {
          if (currentIndex < activities.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            setLessonComplete(true);
          }
        },
        calmMode ? 300 : 1500,
      );
    },
  });

  const handleComplete = useCallback(() => {
    const activity = activities[currentIndex];
    if (!activity || isPending) return;
    completeActivity(activity.id);
  }, [activities, currentIndex, isPending, completeActivity]);

  const isActivityCompleted = useCallback(
    (activityId: string) =>
      completedActivityIds.has(activityId) || localCompleted.has(activityId),
    [completedActivityIds, localCompleted],
  );

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
        <p className="text-lg text-muted-foreground">Loading lesson…</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <EmptyState
        emoji="🔍"
        emojiLabel="Magnifying glass"
        title="Lesson not found"
        description="We couldn't find that lesson. Try going back to your module."
      />
    );
  }

  // Gate premium lessons for free users
  if (lesson.is_premium && !isPremium) {
    return (
      <KidShell title={lesson.title} emoji={lesson.icon}>
        <Link
          href={mod ? `/kid/study/module/${mod.id}` : "/kid/study"}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          ← Back to Module
        </Link>
        <UpgradeBanner
          heading={`${lesson.title} — Premium`}
          description="This lesson is part of the Premium curriculum. Ask a parent to upgrade to unlock it."
          calm={calmMode}
        />
      </KidShell>
    );
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        emoji="📄"
        emojiLabel="Page"
        title="No activities yet"
        description="This lesson doesn't have any activities yet. Check back soon!"
      />
    );
  }

  // --- Lesson Complete screen ---
  if (lessonComplete) {
    return (
      <KidShell title="Lesson Complete!" emoji="🌟">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="text-7xl" role="img" aria-label="Star">
            🌟
          </span>
          <p className="text-3xl font-extrabold text-primary">Great Job!</p>
          <p className="text-lg text-muted-foreground">
            You finished <strong>{lesson.title}</strong>!
          </p>

          {earnedStars > 0 && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-lg font-bold">Stars Earned</p>
              <p className="text-4xl font-extrabold text-primary">
                ⭐ {earnedStars}
              </p>
            </div>
          )}

          <Link
            href={mod ? `/kid/study/module/${mod.id}` : "/kid/study"}
            className={cn(
              "mt-4 rounded-2xl border-2 border-primary bg-primary/10 px-8 py-4",
              "text-lg font-bold text-primary",
              "hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              calmMode ? "" : "transition-transform active:scale-95",
            )}
          >
            ← Back to Module
          </Link>
        </div>
      </KidShell>
    );
  }

  // --- Activity view ---
  const currentActivity = activities[currentIndex];
  const completedCount = activities.filter((a) =>
    isActivityCompleted(a.id),
  ).length;
  const progressPercent =
    activities.length > 0
      ? Math.round((completedCount / activities.length) * 100)
      : 0;

  // Show break screen
  if (showBreak) {
    return (
      <KidShell title="Break Time" emoji="🌿">
        <div className="flex flex-col items-center gap-6">
          <BreakCard calm={calmMode} />
          <button
            type="button"
            onClick={() => setShowBreak(false)}
            className={cn(
              "rounded-2xl border-2 border-primary bg-primary/10 px-8 py-4",
              "text-lg font-bold text-primary",
              "hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              calmMode ? "" : "transition-transform active:scale-95",
            )}
          >
            I&apos;m Ready! 💪
          </button>
        </div>
      </KidShell>
    );
  }

  return (
    <KidShell
      title={lesson.title}
      emoji={lesson.icon}
      trailing={
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
          {currentIndex + 1}/{activities.length}
        </span>
      }
    >
      <Link
        href={mod ? `/kid/study/module/${mod.id}` : "/kid/study"}
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        ← Back to Module
      </Link>

      <ProgressBar
        value={progressPercent}
        label={`${completedCount} of ${activities.length} activities`}
        showPercent
        size="md"
      />

      {/* Current activity card */}
      <div className="relative flex flex-col items-center gap-6 rounded-3xl border-2 border-border bg-card p-6 shadow-sm">
        {/* Celebration overlay */}
        {showCelebration && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-3xl bg-success/10 animate-pulse motion-reduce:animate-none"
            aria-live="polite"
          >
            <span className="text-5xl">🎉</span>
          </div>
        )}

        <span className="text-5xl" role="img" aria-hidden="true">
          {currentActivity.icon}
        </span>

        <h2 className="text-2xl font-extrabold text-center">
          {currentActivity.title}
        </h2>

        <SubjectBadge
          title={currentActivity.activity_type.replace(/_/g, " ")}
          icon={currentActivity.icon}
        />

        {currentActivity.reward_points > 0 && (
          <RewardStars
            earned={isActivityCompleted(currentActivity.id) ? 1 : 0}
            total={1}
            size="lg"
          />
        )}

        {/* Interactive gameplay or simple done button */}
        {!isActivityCompleted(currentActivity.id) ? (
          <ActivityGameplay
            activityId={currentActivity.id}
            activityType={currentActivity.activity_type}
            instructions={currentActivity.instructions}
            calm={calmMode}
            soundEnabled={soundEnabled}
            isPending={isPending}
            onComplete={handleComplete}
          />
        ) : (
          <div className="mt-2 flex items-center gap-2 text-lg font-bold text-success">
            <span>✅</span> Completed!
          </div>
        )}
      </div>

      {/* Take a break option */}
      <button
        type="button"
        onClick={() => setShowBreak(true)}
        className={cn(
          "mx-auto flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-6 py-3",
          "text-base font-semibold text-muted-foreground",
          "hover:bg-secondary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          calmMode ? "" : "transition-transform active:scale-95",
        )}
      >
        🌿 Take a Break
      </button>
    </KidShell>
  );
}

// ---------------------------------------------------------------------------
// ActivityGameplay — renders interactive gameplay or a simple done button
// ---------------------------------------------------------------------------

function ActivityGameplay({
  activityId,
  activityType,
  instructions,
  calm,
  soundEnabled,
  isPending,
  onComplete,
}: {
  activityId: string;
  activityType: string;
  instructions: string;
  calm: boolean;
  soundEnabled: boolean;
  isPending: boolean;
  onComplete: () => void;
}) {
  const gameData = useMemo(
    () =>
      getActivityGameplayData(
        activityId,
        activityType as import("@/lib/studyTypes").ActivityType,
      ),
    [activityId, activityType],
  );

  switch (gameData.type) {
    case "tap_correct":
      return (
        <TapCorrectActivity
          instructions={instructions}
          choices={gameData.choices}
          calm={calm}
          onComplete={onComplete}
        />
      );

    case "visual_matching":
      return (
        <VisualMatchingActivity
          instructions={instructions}
          pairs={gameData.pairs}
          calm={calm}
          onComplete={onComplete}
        />
      );

    case "sequencing":
      return (
        <SequencingActivity
          instructions={instructions}
          steps={gameData.steps}
          calm={calm}
          onComplete={onComplete}
        />
      );

    case "listen_choose":
      return (
        <ListenChooseActivity
          instructions={instructions}
          choices={gameData.choices}
          calm={calm}
          soundEnabled={soundEnabled}
          onComplete={onComplete}
        />
      );

    case "speak_tap_aac":
      return (
        <SpeakTapAacActivity
          instructions={instructions}
          options={gameData.options}
          calm={calm}
          soundEnabled={soundEnabled}
          onComplete={onComplete}
        />
      );

    default:
      // Simple "Done" button for activity types without interactive gameplay
      return (
        <div className="flex flex-col items-center gap-4 w-full">
          <p className="text-center text-lg text-muted-foreground">{instructions}</p>
          <button
            type="button"
            onClick={onComplete}
            disabled={isPending}
            className={cn(
              "mt-2 w-full max-w-xs rounded-2xl border-2 border-success bg-success/10 px-8 py-5",
              "text-xl font-extrabold text-success",
              "hover:bg-success/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              calm ? "" : "transition-transform active:scale-95",
            )}
            aria-label="Mark activity as done"
          >
            {isPending ? "Saving…" : "Done ✅"}
          </button>
        </div>
      );
  }
}
