"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
const TOTAL_STEPS = 7;

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

const ROUTINE_PRESETS = [
  { id: "morning", label: "Morning Routine", emoji: "☀️", desc: "Wake up, brush teeth, breakfast" },
  { id: "school", label: "School Day", emoji: "🎒", desc: "Pack bag, go to school, homework" },
  { id: "evening", label: "Evening Wind Down", emoji: "🌙", desc: "Dinner, bath time, story time" },
];

const STARTER_AAC_CARDS = [
  { label: "Yes", emoji: "👍" },
  { label: "No", emoji: "👎" },
  { label: "Help", emoji: "❓" },
  { label: "Eat", emoji: "🍽️" },
  { label: "Drink", emoji: "🥤" },
  { label: "Toilet", emoji: "🚽" },
  { label: "Play", emoji: "🎮" },
  { label: "More", emoji: "➕" },
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
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);
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
    if (step === 1) return true; // Welcome
    if (step === 2) return childName.trim().length > 0; // Create Profile
    if (step === 3) return !!classLevel && selectedSubjects.size > 0; // Learning Focus
    if (step === 4) return true; // Study Settings (defaults are fine)
    if (step === 5) return true; // First Routine (optional)
    if (step === 6) return true; // Starter AAC Cards (informational)
    if (step === 7) return true; // Setup Complete
    return true;
  };

  const goNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else finishOnboarding(); // step 7 → finish
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
      <div className="mb-8 flex items-center gap-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-2.5 rounded-full transition-all duration-300",
              i + 1 <= step ? "bg-primary w-10" : "bg-muted w-6",
            )}
          />
        ))}
      </div>

      {/* ── Step 1: Welcome ───────────────────────────────────────── */}
      {step === 1 && (
        <Card className="w-full border-0 bg-gradient-to-b from-primary/10 to-background shadow-none">
          <CardHeader className="flex flex-col items-center gap-3 pt-10 text-center">
            <span className="text-7xl" role="img" aria-hidden="true">🏡</span>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Welcome to RoutineNest!
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Build a calm, structured world for your child.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-10" />
        </Card>
      )}

      {/* ── Step 2: Create Profile (Child Name) ───────────────────── */}
      {step === 2 && (
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

      {/* ── Step 3: Learning Focus (Class Level + Subjects) ────────── */}
      {step === 3 && (
        <Card className="w-full">
          <CardHeader className="text-center">
            <span className="text-5xl" role="img" aria-hidden="true">📚</span>
            <CardTitle className="text-2xl">Learning focus</CardTitle>
            <CardDescription>
              Choose a class level and subjects for {childName || "your child"}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Class Level */}
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Class Level</p>
              <div className="grid grid-cols-2 gap-3">
                {SEED_CLASS_LEVELS.map((cl) => (
                  <button
                    key={cl.id}
                    type="button"
                    onClick={() => setClassLevel(cl.id)}
                    className={cn(
                      "rounded-2xl border-2 px-4 py-4 text-center font-semibold min-h-[80px]",
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
            </div>

            {/* Subjects */}
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Focus Subjects</p>
              <div className="grid grid-cols-2 gap-3">
                {SEED_SUBJECT_AREAS.map((sa) => {
                  const selected = selectedSubjects.has(sa.id);
                  return (
                    <button
                      key={sa.id}
                      type="button"
                      onClick={() => toggleSubject(sa.id)}
                      className={cn(
                        "rounded-xl border-2 px-4 py-3 text-center font-semibold",
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 4: Study Settings (Session Length + Intensity) ────── */}
      {step === 4 && (
        <Card className="w-full">
          <CardHeader className="text-center">
            <span className="text-5xl" role="img" aria-hidden="true">⚙️</span>
            <CardTitle className="text-2xl">Study settings</CardTitle>
            <CardDescription>
              Set session length and learning pace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Session Length */}
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Session Length</p>
              <div className="grid grid-cols-2 gap-3">
                {SESSION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSessionLength(opt.value)}
                    className={cn(
                      "rounded-xl border-2 px-4 py-4 text-center font-semibold",
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
            </div>

            {/* Intensity */}
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Learning Intensity</p>
              <div className="flex flex-col gap-3">
                {INTENSITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIntensity(opt.value)}
                    className={cn(
                      "rounded-xl border-2 px-5 py-4 text-left font-semibold",
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 5: First Routine ──────────────────────────────────── */}
      {step === 5 && (
        <Card className="w-full">
          <CardHeader className="text-center">
            <span className="text-5xl" role="img" aria-hidden="true">📋</span>
            <CardTitle className="text-2xl">Pick a first routine</CardTitle>
            <CardDescription>
              Start with a preset routine — you can customise it later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {ROUTINE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedRoutine(preset.id)}
                  className={cn(
                    "rounded-xl border-2 px-5 py-5 text-left font-semibold",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "transition-colors flex items-center gap-4",
                    selectedRoutine === preset.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <span className="text-3xl" aria-hidden="true">{preset.emoji}</span>
                  <div>
                    <p className="text-lg">{preset.label}</p>
                    <p className="text-sm font-normal text-muted-foreground">{preset.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 6: Starter AAC Cards ──────────────────────────────── */}
      {step === 6 && (
        <Card className="w-full">
          <CardHeader className="text-center">
            <span className="text-5xl" role="img" aria-hidden="true">💬</span>
            <CardTitle className="text-2xl">Starter AAC cards</CardTitle>
            <CardDescription>
              {childName || "Your child"} will get these essential communication cards right away.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {STARTER_AAC_CARDS.map((card) => (
                <div
                  key={card.label}
                  className="flex flex-col items-center gap-1 rounded-xl border-2 border-border bg-card px-2 py-4"
                >
                  <span className="text-3xl" aria-hidden="true">{card.emoji}</span>
                  <p className="text-xs font-medium">{card.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 7: Setup Complete ─────────────────────────────────── */}
      {step === 7 && (
        <Card className="w-full border-0 bg-gradient-to-b from-primary/10 to-background shadow-none">
          <CardHeader className="flex flex-col items-center gap-2 pt-10 text-center">
            <span className="text-7xl" role="img" aria-hidden="true">🎉</span>
            <CardTitle className="text-3xl font-bold tracking-tight">
              All Set!
            </CardTitle>
            <CardDescription className="text-base">
              ⭐ {childName || "Your child"}&apos;s profile is ready ⭐
            </CardDescription>
            <p className="mt-2 text-sm text-muted-foreground">
              You can always change settings from the parent dashboard.
            </p>
          </CardHeader>
          <CardContent className="pb-10" />
        </Card>
      )}

      {/* Error display */}
      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Navigation buttons */}
      <div className="mt-8 flex w-full justify-between gap-4">
        {step > 1 ? (
          <Button variant="outline" size="lg" onClick={goBack} disabled={saving} className="min-h-[48px]">
            ← Back
          </Button>
        ) : (
          <div />
        )}

        <Button
          size="lg"
          onClick={goNext}
          disabled={!canNext() || saving}
          className={cn("min-h-[48px]", step === 1 && "px-8 text-base", step === 7 && "px-8 text-base")}
        >
          {saving
            ? "Saving…"
            : step === 1
              ? "Let&apos;s Get Started 🚀"
              : step === 7
                ? "Go to Dashboard 🎉"
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
