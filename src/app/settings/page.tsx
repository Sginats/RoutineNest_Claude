"use client";

import { useState } from "react";
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
import { useRequireAuth } from "@/hooks/useAuth";
import ParentGate from "@/components/ParentGate";
import { useSettings, useUpdateSettings } from "@/lib/settingsHooks";
import { getActiveProfileId } from "@/lib/profileStore";
import {
  getAnalyticsEnabled,
  setAnalyticsEnabled,
} from "@/lib/analytics";

const GRID_OPTIONS = [2, 3, 4] as const;

export default function SettingsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  // Read active profile from localStorage (SSR-safe via getActiveProfileId)
  const [profileId] = useState(() => getActiveProfileId());

  const { data: settings, isLoading: settingsLoading } =
    useSettings(profileId);
  const { mutate: updateSettings } = useUpdateSettings(profileId);

  // Analytics preference is stored in localStorage (client-only).
  // getAnalyticsEnabled() returns true during SSR (window is undefined),
  // matching the default opt-in state, so there is no hydration mismatch.
  const [analyticsEnabled, setAnalyticsEnabledState] = useState(
    () => getAnalyticsEnabled(),
  );

  function handleAnalyticsToggle(checked: boolean) {
    setAnalyticsEnabled(checked);
    setAnalyticsEnabledState(checked);
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!profileId) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No profile selected. Please go to the{" "}
              <a href="/parent" className="text-primary underline">
                Parent Dashboard
              </a>{" "}
              and select a child profile first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (settingsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading settings…</p>
      </div>
    );
  }

  // Derive current values (defaults when no row exists yet)
  const calmMode = settings?.calm_mode ?? false;
  const gridSize = settings?.grid_size ?? 3;
  const soundEnabled = settings?.sound_enabled ?? true;

  return (
    <ParentGate>
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Settings</h1>

        {/* Display settings */}
        <Card>
          <CardHeader>
            <CardTitle>Display</CardTitle>
            <CardDescription>
              Customize how the app looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Calm Mode */}
            <div className="flex items-center justify-between">
              <Label htmlFor="calm-mode" className="flex flex-col gap-1">
                <span className="text-base font-medium">Calm Mode</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Reduce animations and visual stimulation
                </span>
              </Label>
              <Switch
                id="calm-mode"
                checked={calmMode}
                onCheckedChange={(checked) =>
                  updateSettings({ calm_mode: checked })
                }
                aria-label="Toggle calm mode"
              />
            </div>

            {/* Grid Size */}
            <div className="flex flex-col gap-2">
              <Label className="flex flex-col gap-1">
                <span className="text-base font-medium">Grid Size</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Number of columns in card grids
                </span>
              </Label>
              <div className="flex gap-2">
                {GRID_OPTIONS.map((size) => (
                  <Button
                    key={size}
                    variant={gridSize === size ? "default" : "outline"}
                    size="lg"
                    className="flex-1"
                    onClick={() => updateSettings({ grid_size: size })}
                    aria-pressed={gridSize === size}
                    aria-label={`${size} columns`}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sound settings */}
        <Card>
          <CardHeader>
            <CardTitle>Sound</CardTitle>
            <CardDescription>
              Manage audio feedback and text-to-speech
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-enabled" className="flex flex-col gap-1">
                <span className="text-base font-medium">Sound Enabled</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Play sounds and enable text-to-speech
                </span>
              </Label>
              <Switch
                id="sound-enabled"
                checked={soundEnabled}
                onCheckedChange={(checked) =>
                  updateSettings({ sound_enabled: checked })
                }
                aria-label="Toggle sound"
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy / Analytics settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>
              Control anonymous usage analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label
                htmlFor="analytics-enabled"
                className="flex flex-col gap-1"
              >
                <span className="text-base font-medium">
                  Analytics Enabled
                </span>
                <span className="text-sm text-muted-foreground font-normal">
                  Send anonymous usage data to help improve the app. No
                  personal information is collected.
                </span>
              </Label>
              <Switch
                id="analytics-enabled"
                checked={analyticsEnabled}
                onCheckedChange={handleAnalyticsToggle}
                aria-label="Toggle analytics"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </ParentGate>
  );
}
