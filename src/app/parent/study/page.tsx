"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SubjectBadge } from "@/components/study/SubjectBadge";
import { useRequireAuth } from "@/hooks/useAuth";
import { getActiveProfileId } from "@/lib/profileStore";
import {
  getChildLearningPlan,
  upsertChildLearningPlan,
  getChildPreferences,
  upsertChildPreferences,
  getWeeklyPlanEntries,
  replaceWeeklyPlanEntries,
} from "@/lib/studyDb";
import {
  SEED_YEAR_CATEGORIES,
  SEED_CLASS_LEVELS,
  SEED_SUBJECT_AREAS,
} from "@/lib/studySeedData";
import type { StudyIntensity, DayOfWeek } from "@/lib/studyTypes";

// ── Constants ────────────────────────────────────────────────────────────────

const INTENSITY_OPTIONS: {
  value: StudyIntensity;
  label: string;
  description: string;
}[] = [
  { value: "light", label: "Light", description: "2 activities / day" },
  { value: "medium", label: "Medium", description: "4 activities / day" },
  { value: "focused", label: "Focused", description: "6 activities / day" },
];

const SESSION_PRESETS = [5, 10, 15] as const;

const DEFAULT_SUBJECT_IDS = ["sa-communication", "sa-daily-living"];

const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
  { value: "monday", label: "Monday", short: "Mon" },
  { value: "tuesday", label: "Tuesday", short: "Tue" },
  { value: "wednesday", label: "Wednesday", short: "Wed" },
  { value: "thursday", label: "Thursday", short: "Thu" },
  { value: "friday", label: "Friday", short: "Fri" },
  { value: "saturday", label: "Saturday", short: "Sat" },
  { value: "sunday", label: "Sunday", short: "Sun" },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ParentStudyPlannerPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const queryClient = useQueryClient();
  const profileId = typeof window !== "undefined" ? getActiveProfileId() : null;

  // ── Form state ───────────────────────────────────────────────────────────
  const [selectedYearCategory, setSelectedYearCategory] = useState<string>("");
  const [selectedClassLevel, setSelectedClassLevel] = useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(DEFAULT_SUBJECT_IDS);
  const [intensity, setIntensity] = useState<StudyIntensity>("medium");
  const [sessionLength, setSessionLength] = useState<number>(10);
  const [repeatCompleted, setRepeatCompleted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  // Weekly plan state: map of day → subject area IDs
  const [weeklyPlan, setWeeklyPlan] = useState<Record<DayOfWeek, string[]>>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: existingPlan, isLoading: planLoading } = useQuery({
    queryKey: ["childLearningPlan", profileId],
    queryFn: () => getChildLearningPlan(profileId!),
    enabled: !!profileId,
  });

  const { data: preferences } = useQuery({
    queryKey: ["childPreferences", profileId],
    queryFn: () => getChildPreferences(profileId!),
    enabled: !!profileId,
  });

  const { data: existingWeeklyEntries } = useQuery({
    queryKey: ["weeklyPlanEntries", existingPlan?.id],
    queryFn: () => getWeeklyPlanEntries(existingPlan!.id),
    enabled: !!existingPlan?.id,
  });

  // ── Hydrate form from existing data ──────────────────────────────────────
  useEffect(() => {
    if (existingPlan) {
      // Wrap in setTimeout to satisfy react-hooks/set-state-in-effect
      setTimeout(() => {
        setSelectedClassLevel(existingPlan.class_level_id);
        setIntensity(existingPlan.intensity);
        setSessionLength(existingPlan.session_length_minutes);
        setSelectedSubjects(
          existingPlan.subject_area_ids.length > 0
            ? existingPlan.subject_area_ids
            : DEFAULT_SUBJECT_IDS,
        );
        const cl = SEED_CLASS_LEVELS.find((c) => c.id === existingPlan.class_level_id);
        if (cl) {
          setSelectedYearCategory(cl.year_category_id);
        } else {
          setSelectedClassLevel("");
          setSelectedYearCategory("");
        }
      }, 0);
    }
  }, [existingPlan]);

  useEffect(() => {
    if (preferences) {
      setTimeout(() => setRepeatCompleted(preferences.repeat_completed_lessons), 0);
    }
  }, [preferences]);

  // Hydrate weekly plan from existing entries
  useEffect(() => {
    if (existingWeeklyEntries && existingWeeklyEntries.length > 0) {
      setTimeout(() => {
        const plan: Record<DayOfWeek, string[]> = {
          monday: [], tuesday: [], wednesday: [], thursday: [],
          friday: [], saturday: [], sunday: [],
        };
        for (const entry of existingWeeklyEntries) {
          const day = entry.day as DayOfWeek;
          if (plan[day]) {
            plan[day].push(entry.subject_area_id);
          }
        }
        setWeeklyPlan(plan);
      }, 0);
    }
  }, [existingWeeklyEntries]);

  // ── Derived data ─────────────────────────────────────────────────────────
  const classLevelsForCategory = useMemo(
    () => SEED_CLASS_LEVELS.filter((cl) => cl.year_category_id === selectedYearCategory),
    [selectedYearCategory],
  );

  const selectedYearCategoryData = useMemo(
    () => SEED_YEAR_CATEGORIES.find((yc) => yc.id === selectedYearCategory),
    [selectedYearCategory],
  );

  // ── Mutations ────────────────────────────────────────────────────────────
  const savePlanMutation = useMutation({
    mutationFn: async () => {
      if (!profileId) throw new Error("No active profile");
      const savedPlan = await upsertChildLearningPlan({
        profile_id: profileId,
        class_level_id: selectedClassLevel,
        intensity,
        session_length_minutes: sessionLength,
        subject_area_ids: selectedSubjects,
        is_active: true,
      });
      await upsertChildPreferences(profileId, {
        repeat_completed_lessons: repeatCompleted,
      });
      // Save weekly plan entries
      const entries: { day: DayOfWeek; subject_area_id: string; order: number }[] = [];
      for (const day of DAYS_OF_WEEK) {
        const subjects = weeklyPlan[day.value];
        subjects.forEach((subjectId, idx) => {
          entries.push({ day: day.value, subject_area_id: subjectId, order: idx });
        });
      }
      await replaceWeeklyPlanEntries(savedPlan.id, entries);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["childLearningPlan", profileId] });
      queryClient.invalidateQueries({ queryKey: ["childPreferences", profileId] });
      queryClient.invalidateQueries({ queryKey: ["weeklyPlanEntries"] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleYearCategoryChange(ycId: string) {
    setSelectedYearCategory(ycId);
    setSelectedClassLevel("");
    setSaveSuccess(false);
  }

  function handleClassLevelChange(clId: string) {
    setSelectedClassLevel(clId);
    setSaveSuccess(false);
  }

  function toggleSubject(subjectId: string) {
    setSaveSuccess(false);
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId],
    );
  }

  function toggleWeeklySubject(day: DayOfWeek, subjectId: string) {
    setSaveSuccess(false);
    setWeeklyPlan((prev) => {
      const daySubjects = prev[day];
      const updated = daySubjects.includes(subjectId)
        ? daySubjects.filter((id) => id !== subjectId)
        : [...daySubjects, subjectId];
      return { ...prev, [day]: updated };
    });
  }

  const canSave =
    !!selectedClassLevel &&
    selectedSubjects.length > 0 &&
    !savePlanMutation.isPending;

  // ── Loading / auth guard ─────────────────────────────────────────────────
  if (authLoading || planLoading) {
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

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Study Planner</h1>
          <p className="text-sm text-muted-foreground">
            Customize your child&apos;s learning plan
          </p>
        </div>
        <Link href="/parent">
          <Button variant="outline" size="sm">
            ← Back
          </Button>
        </Link>
      </div>

      {/* Section 1 — Learning Track */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Track</CardTitle>
          <CardDescription>
            Choose the year category and class level that best fits your child.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Year Categories */}
          <div className="space-y-2">
            <Label>Year Category</Label>
            <div className="flex flex-wrap gap-2">
              {SEED_YEAR_CATEGORIES.map((yc) => (
                <Button
                  key={yc.id}
                  variant={selectedYearCategory === yc.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleYearCategoryChange(yc.id)}
                >
                  {yc.icon} {yc.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Age group info */}
          {selectedYearCategoryData && (
            <p className="text-sm text-muted-foreground">
              Ages {selectedYearCategoryData.age_min}–{selectedYearCategoryData.age_max} · {selectedYearCategoryData.description}
            </p>
          )}

          {/* Class Levels */}
          {selectedYearCategory && (
            <div className="space-y-2">
              <Label>Class Level</Label>
              <div className="flex flex-wrap gap-2">
                {classLevelsForCategory.map((cl) => (
                  <Button
                    key={cl.id}
                    variant={selectedClassLevel === cl.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleClassLevelChange(cl.id)}
                  >
                    {cl.icon} {cl.title}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2 — Subject Focus */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Focus</CardTitle>
          <CardDescription>
            Tap to include or exclude subjects. Communication and Daily Living are selected by default.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SEED_SUBJECT_AREAS.map((sa) => (
              <SubjectBadge
                key={sa.id}
                title={sa.title}
                icon={sa.icon}
                selected={selectedSubjects.includes(sa.id)}
                onClick={() => toggleSubject(sa.id)}
              />
            ))}
          </div>
          {selectedSubjects.length === 0 && (
            <p className="mt-2 text-sm text-destructive">
              Select at least one subject to continue.
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            {selectedSubjects.length} of {SEED_SUBJECT_AREAS.length} subjects selected
          </p>
        </CardContent>
      </Card>

      {/* Section 2b — Weekly Plan */}
      {selectedSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Plan</CardTitle>
            <CardDescription>
              Assign subjects to days of the week. Tap a subject badge under each day to toggle it.
              If no days are configured, all selected subjects show every day.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DAYS_OF_WEEK.map((day) => {
              const daySubjects = weeklyPlan[day.value];
              const availableSubjects = SEED_SUBJECT_AREAS.filter((sa) =>
                selectedSubjects.includes(sa.id),
              );
              return (
                <div key={day.value} className="space-y-1.5">
                  <Label className="text-sm font-bold">{day.label}</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSubjects.map((sa) => (
                      <SubjectBadge
                        key={sa.id}
                        title={sa.title}
                        icon={sa.icon}
                        selected={daySubjects.includes(sa.id)}
                        onClick={() => toggleWeeklySubject(day.value, sa.id)}
                      />
                    ))}
                  </div>
                  {daySubjects.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No subjects — all selected subjects will appear
                    </p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Section 3 — Study Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Study Settings</CardTitle>
          <CardDescription>
            Control the pace and length of each study session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Intensity */}
          <div className="space-y-2">
            <Label>Daily Intensity</Label>
            <div className="flex gap-2">
              {INTENSITY_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={intensity === opt.value ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setIntensity(opt.value);
                    setSaveSuccess(false);
                  }}
                >
                  <span className="flex flex-col items-center gap-0.5">
                    <span className="font-semibold">{opt.label}</span>
                    <span className="text-[10px] opacity-70">{opt.description}</span>
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Session length */}
          <div className="space-y-2">
            <Label>Session Length</Label>
            <div className="flex gap-2">
              {SESSION_PRESETS.map((mins) => (
                <Button
                  key={mins}
                  variant={sessionLength === mins ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSessionLength(mins);
                    setSaveSuccess(false);
                  }}
                >
                  {mins} min
                </Button>
              ))}
            </div>
          </div>

          {/* Repeat completed */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="repeat-switch">Repeat Completed Lessons</Label>
              <p className="text-xs text-muted-foreground">
                Allow your child to redo lessons they&apos;ve already finished
              </p>
            </div>
            <Switch
              id="repeat-switch"
              checked={repeatCompleted}
              onCheckedChange={(checked) => {
                setRepeatCompleted(checked);
                setSaveSuccess(false);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 4 — Save */}
      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            {saveSuccess && (
              <p className="text-sm font-medium text-green-600">
                ✓ Plan saved successfully!
              </p>
            )}
            {savePlanMutation.isError && (
              <p className="text-sm font-medium text-destructive">
                Something went wrong — please try again.
              </p>
            )}
          </div>
          <Button
            disabled={!canSave}
            onClick={() => savePlanMutation.mutate()}
          >
            {savePlanMutation.isPending ? "Saving…" : "Save Plan"}
          </Button>
        </CardContent>
      </Card>

      {/* Link to progress */}
      <div className="text-center">
        <Link
          href="/parent/study/progress"
          className="text-sm text-primary underline"
        >
          View progress dashboard →
        </Link>
      </div>
    </main>
  );
}
