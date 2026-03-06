"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRequireAuth } from "@/hooks/useAuth";
import { createProfile } from "@/lib/db";
import { setActiveProfileId } from "@/lib/profileStore";
import { upsertChildLearningPlan, upsertChildPreferences } from "@/lib/studyDb";
import {
  SEED_CLASS_LEVELS,
  SEED_SUBJECT_AREAS,
} from "@/lib/studySeedData";
import { cn } from "@/lib/utils";

import type { StudyIntensity } from "@/lib/studyTypes";

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------
const TOTAL_STEPS = 5;

const INTENSITY_OPTIONS: { value: StudyIntensity; label: string; desc: string; emoji: string }[] = [
  { value: "light", label: "Light", desc: "2 activities per day", emoji: "🌱" },
  { value: "medium", label: "Medium", desc: "4 activities per day", emoji: "🌿" },
  { value: "focused", label: "Focused", desc: "6 activities per day", emoji: "🌳" },
];

const SESSION_OPTIONS = [
  { value: 5, label: "5 min", emoji: "⚡" },
  { value: 10, label: "10 min", emoji: "⏱️" },
  { value: 15, label: "15 min", emoji: "🕐" },
  { value: 20, label: "20 min", emoji: "📚" },
];

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth();
  const queryClient = useQueryClient();

  // Wizard state
  const [step, setStep] = useState(1);
  const [childName, setChildName] = useState("");
  const [classLevel, setClassLevel] = useState<string>(SEED_CLASS_LEVELS[0].id);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(
    () => new Set([SEED_SUBJECT_AREAS[0].id, SEED_SUBJECT_AREAS[3].id]),
  );
  const [sessionLength, setSessionLength] = useState(10);
  const [intensity, setIntensity] = useState<StudyIntensity>("light");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle subject selection
  const toggleSubject = useCallback((id: string) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Final save
  const finishOnboarding = useCallback(async () => {
    if (!user || !childName.trim()) return;
    setSaving(true);
    setError(null);

    try {
      // 1. Create child profile
      const profile = await createProfile(childName.trim());
      setActiveProfileId(profile.id);

      // 2. Create learning plan
      await upsertChildLearningPlan({
        profile_id: profile.id,
        class_level_id: classLevel,
        intensity,
        session_length_minutes: sessionLength,
        subject_area_ids: Array.from(selectedSubjects),
        is_active: true,
      });

      // 3. Save preferences
      await upsertChildPreferences(profile.id, {
        preferred_difficulty: 1,
        favorite_subject_ids: Array.from(selectedSubjects),
        repeat_completed_lessons: false,
      });

      // Invalidate queries so parent dashboard picks up the new profile
      queryClient.invalidateQueries({ queryKey: ["profiles"] });

      // Navigate to parent dashboard
      router.push("/parent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }, [user, childName, classLevel, intensity, sessionLength, selectedSubjects, queryClient, router]);

  // Navigation helpers
  const canNext = () => {
    if (step === 1) return childName.trim().length > 0;
    if (step === 2) return !!classLevel;
    if (step === 3) return selectedSubjects.size > 0;
    return true;
  };

  const goNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else finishOnboarding();
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Loading guard
  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center px-4 py-10">
      {/* Progress indicator */}
      <div className="mb-6 flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-10 rounded-full",
              i + 1 <= step ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>

      {/* ── Step 1: Child Name ─────────────────────────────────────── */}
      {step === 1 && (
        <Card className="w-full">
          <CardHeader className="text-center">
            <span className="text-5xl" role="img" aria-hidden="true">👶</span>
            <CardTitle className="text-2xl">What&apos;s your child&apos;s name?</CardTitle>
            <CardDescription>
              We&apos;ll create a profile just for them.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="childName">Child&apos;s name</Label>
              <Input
                id="childName"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="e.g. Alex"
                className="mt-1 text-lg"
                autoFocus
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Class Level ────────────────────────────────────── */}
      {step === 2 && (
        <Card className="w-full">
          <CardHeader className="text-center">
            <span className="text-5xl" role="img" aria-hidden="true">🎓</span>
            <CardTitle className="text-2xl">Choose a class level</CardTitle>
            <CardDescription>
              This helps us suggest the right activities for {childName || "your child"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {SEED_CLASS_LEVELS.map((cl) => (
                <button
                  key={cl.id}
                  type="button"
                  onClick={() => setClassLevel(cl.id)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-4 text-center font-semibold",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "transition-colors",
                    classLevel === cl.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <span className="text-2xl" aria-hidden="true">{cl.icon}</span>
                  <p className="mt-1 text-sm">{cl.title}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 3: Focus Subjects ─────────────────────────────────── */}
      {step === 3 && (
        <Card className="w-full">
          <CardHeader className="text-center">
            <span className="text-5xl" role="img" aria-hidden="true">📚</span>
            <CardTitle className="text-2xl">Pick focus subjects</CardTitle>
            <CardDescription>
              Select one or more subjects for {childName || "your child"} to work on.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {SEED_SUBJECT_AREAS.map((sa) => {
                const selected = selectedSubjects.has(sa.id);
                return (
                  <button
                    key={sa.id}
                    type="button"
                    onClick={() => toggleSubject(sa.id)}
                    className={cn(
                      "rounded-xl border-2 px-4 py-4 text-center font-semibold",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card hover:border-primary/40",
                    )}
                  >
                    <span className="text-2xl" aria-hidden="true">{sa.icon}</span>
                    <p className="mt-1 text-sm">{sa.title}</p>
                    {selected && <span className="text-xs text-primary">✓</span>}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 4: Session Duration ───────────────────────────────── */}
      {step === 4 && (
        <Card className="w-full">
          <CardHeader className="text-center">
            <span className="text-5xl" role="img" aria-hidden="true">⏱️</span>
            <CardTitle className="text-2xl">Session length</CardTitle>
            <CardDescription>
              How long should each study session be?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {SESSION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSessionLength(opt.value)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-5 text-center font-semibold",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "transition-colors",
                    sessionLength === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <span className="text-2xl" aria-hidden="true">{opt.emoji}</span>
                  <p className="mt-1">{opt.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 5: Learning Intensity ─────────────────────────────── */}
      {step === 5 && (
        <Card className="w-full">
          <CardHeader className="text-center">
            <span className="text-5xl" role="img" aria-hidden="true">🌱</span>
            <CardTitle className="text-2xl">Learning intensity</CardTitle>
            <CardDescription>
              Start easy and increase later if you want.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {INTENSITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIntensity(opt.value)}
                  className={cn(
                    "rounded-xl border-2 px-5 py-5 text-left font-semibold",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "transition-colors flex items-center gap-4",
                    intensity === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <span className="text-3xl" aria-hidden="true">{opt.emoji}</span>
                  <div>
                    <p className="text-lg">{opt.label}</p>
                    <p className="text-sm font-normal text-muted-foreground">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error display */}
      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Navigation buttons */}
      <div className="mt-6 flex w-full justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={goBack} disabled={saving}>
            ← Back
          </Button>
        ) : (
          <div />
        )}

        <Button
          onClick={goNext}
          disabled={!canNext() || saving}
        >
          {saving
            ? "Saving…"
            : step === TOTAL_STEPS
              ? "Finish Setup ✨"
              : "Next →"}
        </Button>
      </div>

      {/* Skip option */}
      <button
        type="button"
        onClick={() => router.push("/parent")}
        className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Skip for now
      </button>
    </main>
  );
}
