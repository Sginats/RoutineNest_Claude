"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressBar } from "@/components/study/ProgressBar";
import { RewardStars } from "@/components/study/RewardStars";
import { useRequireAuth } from "@/hooks/useAuth";
import ParentGate from "@/components/ParentGate";
import { getActiveProfileId } from "@/lib/profileStore";
import { getChildProgress, getChildLearningPlan } from "@/lib/studyDb";
import {
  SEED_SUBJECT_AREAS,
  SEED_MODULES,
  SEED_LESSONS,
  SEED_ACTIVITIES,
} from "@/lib/studySeedData";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Build a lookup from activity ID → subject area ID via lesson → module. */
function buildActivitySubjectMap(): Map<string, string> {
  const lessonToModule = new Map<string, string>();
  for (const l of SEED_LESSONS) lessonToModule.set(l.id, l.module_id);

  const moduleToSubject = new Map<string, string>();
  for (const m of SEED_MODULES) moduleToSubject.set(m.id, m.subject_area_id);

  const map = new Map<string, string>();
  for (const a of SEED_ACTIVITIES) {
    const modId = lessonToModule.get(a.lesson_id);
    if (modId) {
      const subId = moduleToSubject.get(modId);
      if (subId) map.set(a.id, subId);
    }
  }
  return map;
}

/** Convert an ISO timestamp to a local YYYY-MM-DD string. */
function toLocalDateStr(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Count unique local dates to compute streak from the most recent date backwards. */
function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const unique = [...new Set(dates.map(toLocalDateStr))].sort().reverse();
  const today = toLocalDateStr(new Date().toISOString());

  // Streak must start from today or yesterday
  const first = unique[0];
  if (!first) return 0;

  const diffFromToday = Math.floor(
    (new Date(today).getTime() - new Date(first).getTime()) / 86_400_000,
  );
  if (diffFromToday > 1) return 0;

  let streak = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]!).getTime();
    const curr = new Date(unique[i]!).getTime();
    if (prev - curr === 86_400_000) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ParentProgressPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const profileId = typeof window !== "undefined" ? getActiveProfileId() : null;

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["childProgress", profileId],
    queryFn: () => getChildProgress(profileId!),
    enabled: !!profileId,
  });

  const { data: plan } = useQuery({
    queryKey: ["childLearningPlan", profileId],
    queryFn: () => getChildLearningPlan(profileId!),
    enabled: !!profileId,
  });

  // ── Derived stats ────────────────────────────────────────────────────────
  const activitySubjectMap = useMemo(() => buildActivitySubjectMap(), []);

  const stats = useMemo(() => {
    const items = progress ?? [];
    const completed = items.filter((p) => p.completed);

    const totalActivities = completed.length;
    const uniqueLessons = new Set(completed.map((p) => p.lesson_id));
    const totalLessons = uniqueLessons.size;
    const totalStars = completed.reduce(
      (sum, p) => sum + (p.score ?? 0),
      0,
    );

    const completionDates = completed
      .map((p) => p.completed_at)
      .filter((d): d is string => !!d);
    const streak = computeStreak(completionDates);

    return { totalActivities, totalLessons, totalStars, streak };
  }, [progress]);

  const subjectStats = useMemo(() => {
    const items = progress ?? [];
    const planSubjects = plan?.subject_area_ids ?? SEED_SUBJECT_AREAS.map((s) => s.id);

    return SEED_SUBJECT_AREAS.filter((sa) => planSubjects.includes(sa.id)).map(
      (sa) => {
        // Total activities for this subject from seed data
        const totalForSubject = SEED_ACTIVITIES.filter(
          (a) => activitySubjectMap.get(a.id) === sa.id,
        ).length;

        // Completed activities for this subject
        const completedForSubject = items.filter(
          (p) => p.completed && activitySubjectMap.get(p.activity_id) === sa.id,
        ).length;

        const pct =
          totalForSubject > 0
            ? Math.round((completedForSubject / totalForSubject) * 100)
            : 0;

        return {
          ...sa,
          completed: completedForSubject,
          total: totalForSubject,
          percent: pct,
        };
      },
    );
  }, [progress, plan, activitySubjectMap]);

  const recentActivity = useMemo(() => {
    const items = progress ?? [];
    return items
      .filter((p) => p.completed && p.completed_at)
      .sort(
        (a, b) =>
          new Date(b.completed_at!).getTime() -
          new Date(a.completed_at!).getTime(),
      )
      .slice(0, 10);
  }, [progress]);

  // Activity ID → display info lookup
  const activityLookup = useMemo(() => {
    const map = new Map<string, { title: string; icon: string }>();
    for (const a of SEED_ACTIVITIES) map.set(a.id, { title: a.title, icon: a.icon });
    return map;
  }, []);

  // ── Loading / auth guard ─────────────────────────────────────────────────
  if (authLoading || progressLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  if (!profileId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-muted-foreground">
          No child profile selected.{" "}
          <Link href="/parent" className="text-primary underline">
            Go back
          </Link>{" "}
          and select a profile first.
        </p>
      </div>
    );
  }

  const hasProgress = (progress ?? []).length > 0;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <ParentGate>
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Progress Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Track your child&apos;s learning journey
          </p>
        </div>
        <Link href="/parent">
          <Button variant="outline" size="sm">
            ← Back
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {!hasProgress && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-3xl">📊</p>
            <p className="mt-2 font-semibold">No progress yet</p>
            <p className="text-sm text-muted-foreground">
              Once your child starts activities, their progress will appear here.
            </p>
            <Link href="/parent/study" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                Set up a study plan →
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats overview */}
      {hasProgress && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Activities" value={stats.totalActivities} icon="✅" />
            <StatCard label="Lessons" value={stats.totalLessons} icon="📖" />
            <StatCard label="Stars" value={stats.totalStars} icon="⭐" />
            <StatCard label="Day Streak" value={stats.streak} icon="🔥" />
          </div>

          {/* Star display */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stars Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <RewardStars
                earned={Math.min(stats.totalStars, 10)}
                total={10}
                size="lg"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {stats.totalStars} total stars across all activities
              </p>
            </CardContent>
          </Card>

          {/* Subject progress */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Progress</CardTitle>
              <CardDescription>
                How your child is doing in each subject area
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {subjectStats.map((sa) => (
                <div key={sa.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {sa.icon} {sa.title}
                    </span>
                    <span className="text-muted-foreground">
                      {sa.completed}/{sa.total} activities
                    </span>
                  </div>
                  <ProgressBar value={sa.percent} size="sm" showPercent />
                </div>
              ))}
              {subjectStats.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No subjects configured.{" "}
                  <Link
                    href="/parent/study"
                    className="text-primary underline"
                  >
                    Set up a study plan
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                The latest completed activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No completed activities yet.
                </p>
              ) : (
                <ul className="divide-y">
                  {recentActivity.map((entry) => {
                    const info = activityLookup.get(entry.activity_id);
                    const when = entry.completed_at
                      ? formatRelativeDate(entry.completed_at)
                      : "";

                    return (
                      <li
                        key={entry.id}
                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{info?.icon ?? "📝"}</span>
                          <span className="text-sm font-medium">
                            {info?.title ?? entry.activity_id}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {when}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Link back to planner */}
      <div className="text-center">
        <Link
          href="/parent/study"
          className="text-sm text-primary underline"
        >
          ← Edit study plan
        </Link>
      </div>
    </main>
    </ParentGate>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-4">
        <span className="text-2xl">{icon}</span>
        <span className="mt-1 text-2xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

// ── Utilities ────────────────────────────────────────────────────────────────

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
