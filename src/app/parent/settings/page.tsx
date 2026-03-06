"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/useAuth";
import ParentGate from "@/components/ParentGate";
import { Switch } from "@/components/ui/switch";
import { getActiveProfileId } from "@/lib/profileStore";
import { useSettings, useUpdateSettings } from "@/lib/settingsHooks";
import { getProfiles } from "@/lib/db";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

// ── Toggle Row ────────────────────────────────────────────────────────────────

function ToggleRow({
  icon,
  iconBg,
  label,
  description,
  checked,
  onCheckedChange,
  id,
}: {
  icon: string;
  iconBg: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id: string;
}) {
  return (
    <div className="flex items-center gap-4 min-h-[80px] px-4 py-3">
      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          iconBg,
        )}
      >
        <span className="material-symbols-outlined text-xl text-white">
          {icon}
        </span>
      </div>

      {/* Label & description */}
      <div className="flex flex-1 flex-col gap-0.5">
        <label htmlFor={id} className="text-base font-semibold text-foreground cursor-pointer">
          {label}
        </label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Switch */}
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
      {children}
    </h2>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ParentSettingsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [profileId] = useState(() => getActiveProfileId());

  const { data: settings, isLoading: settingsLoading } =
    useSettings(profileId);
  const { mutate: updateSettings } = useUpdateSettings(profileId);

  // Fetch profile to display child name
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: getProfiles,
    enabled: !!user,
  });

  const activeProfile = profiles.find((p) => p.id === profileId) ?? null;

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
        <h1 className="text-3xl font-extrabold text-primary">⚙️ Settings</h1>
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

  if (settingsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading settings…</p>
      </div>
    );
  }

  // Derive current values with defaults
  const calmMode = settings?.calm_mode ?? false;
  const bigButtonMode = settings?.big_button_mode ?? false;
  const soundEnabled = settings?.sound_enabled ?? true;

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
            ⚙️ Settings
          </h1>
        </div>

        {/* Profile info card */}
        <div className="flex items-center gap-4 rounded-2xl border bg-white px-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <span className="material-symbols-outlined text-2xl text-primary">
              face
            </span>
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-bold text-foreground">
              {activeProfile?.display_name ?? "Child"}
            </p>
            <p className="text-sm text-muted-foreground">Active profile</p>
          </div>
        </div>

        {/* Accessibility & Visuals */}
        <div className="flex flex-col gap-3">
          <SectionHeader>Accessibility & Visuals</SectionHeader>
          <div className="divide-y rounded-2xl border bg-white">
            <ToggleRow
              id="calm-mode"
              icon="spa"
              iconBg="bg-indigo-500"
              label="Calm Mode"
              description="Softer colors and reduced animations for a calmer experience"
              checked={calmMode}
              onCheckedChange={(checked) =>
                updateSettings({ calm_mode: checked })
              }
            />
            <ToggleRow
              id="big-button-mode"
              icon="open_with"
              iconBg="bg-amber-500"
              label="Big Button Mode"
              description="Larger touch targets for easier interaction"
              checked={bigButtonMode}
              onCheckedChange={(checked) =>
                updateSettings({ big_button_mode: checked })
              }
            />
          </div>
        </div>

        {/* Audio & Speech */}
        <div className="flex flex-col gap-3">
          <SectionHeader>Audio & Speech</SectionHeader>
          <div className="divide-y rounded-2xl border bg-white">
            <ToggleRow
              id="sound-effects"
              icon="volume_up"
              iconBg="bg-emerald-500"
              label="Sound Effects"
              description="Play audio feedback and text-to-speech sounds"
              checked={soundEnabled}
              onCheckedChange={(checked) =>
                updateSettings({ sound_enabled: checked })
              }
            />
          </div>
        </div>

        {/* Reset section */}
        <div className="flex flex-col gap-3">
          <SectionHeader>Data & Progress</SectionHeader>
          <div className="rounded-2xl border bg-white">
            <button
              type="button"
              className="flex w-full items-center gap-4 min-h-[80px] px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500">
                <span className="material-symbols-outlined text-xl text-white">
                  restart_alt
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-base font-semibold text-foreground">
                  Reset Routine Progress
                </span>
                <span className="text-sm text-muted-foreground">
                  Clear all completed items and start fresh
                </span>
              </div>
              <span className="material-symbols-outlined text-slate-300">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </ParentGate>
  );
}
