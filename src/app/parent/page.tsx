"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequireAuth } from "@/hooks/useAuth";
import ParentGate from "@/components/ParentGate";
import { getProfiles, createProfile } from "@/lib/db";
import {
  getActiveProfileId,
  setActiveProfileId,
} from "@/lib/profileStore";
import type { Profile } from "@/lib/types";

export default function ParentPage() {
  const { user, loading, logout } = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- active profile stored in localStorage ---
  // Lazy initialiser is safe: the component only renders content after auth
  // resolves, so SSR and initial hydration both show the loading gate.
  const [storedId, setStoredId] = useState<string | null>(
    () => getActiveProfileId(),
  );

  // --- profiles query ---
  const {
    data: profiles = [],
    isLoading: profilesLoading,
    error: profilesError,
  } = useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: getProfiles,
    enabled: !!user,
  });

  // Derive effective active ID — ignore a stored ID that no longer matches
  const activeId =
    !profilesLoading &&
    profiles.length > 0 &&
    storedId &&
    !profiles.some((p) => p.id === storedId)
      ? null
      : storedId;

  // --- create profile mutation ---
  const [newName, setNewName] = useState("");

  const createMutation = useMutation({
    mutationFn: (name: string) => createProfile(name),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setNewName("");
      // Auto-select the newly created profile
      setStoredId(created.id);
      setActiveProfileId(created.id);
    },
  });

  // --- handlers ---
  function handleSelect(profile: Profile) {
    setStoredId(profile.id);
    setActiveProfileId(profile.id);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;
    createMutation.mutate(trimmed);
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  // --- loading / auth gate ---
  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const activeProfile = profiles.find((p) => p.id === activeId) ?? null;

  return (
    <ParentGate>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Parent Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            Log Out
          </Button>
        </div>

        {/* Active profile banner */}
        {activeProfile && (
          <div
            role="status"
            className="rounded-lg border bg-primary/10 p-4 text-center text-lg font-semibold"
          >
            Active profile: {activeProfile.display_name}
          </div>
        )}

        {/* Profiles section */}
        <Card>
          <CardHeader>
            <CardTitle>Profiles</CardTitle>
            <CardDescription>
              Select or create a child profile
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Error state */}
            {profilesError && (
              <p className="text-sm text-destructive">
                Failed to load profiles. Please try again.
              </p>
            )}

            {/* Profile list */}
            {profilesLoading ? (
              <p className="text-muted-foreground">Loading profiles…</p>
            ) : profiles.length === 0 ? (
              <p className="text-muted-foreground">
                No profiles yet. Create one below.
              </p>
            ) : (
              <ul className="flex flex-col gap-3" aria-label="Profiles">
                {profiles.map((profile) => {
                  const isActive = profile.id === activeId;
                  return (
                    <li key={profile.id}>
                      <Button
                        variant={isActive ? "default" : "outline"}
                        size="lg"
                        className="w-full justify-start text-lg"
                        aria-pressed={isActive}
                        onClick={() => handleSelect(profile)}
                      >
                        {profile.display_name}
                        {isActive && (
                          <span className="ml-auto text-sm font-normal">
                            ✓ Active
                          </span>
                        )}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Create profile form */}
            <form
              onSubmit={handleCreate}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="new-profile-name">New profile name</Label>
                <Input
                  id="new-profile-name"
                  placeholder="e.g. Alex"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  maxLength={50}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={createMutation.isPending || !newName.trim()}
              >
                {createMutation.isPending ? "Creating…" : "Add Profile"}
              </Button>
            </form>

            {createMutation.isError && (
              <p className="text-sm text-destructive">
                Could not create profile. Please try again.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Dashboard cards (placeholders) */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                Manage your child&apos;s daily routine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full">
                Edit Schedule
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Talk Board</CardTitle>
              <CardDescription>
                Customize AAC communication buttons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full">
                Edit Talk Board
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rewards</CardTitle>
              <CardDescription>
                Set up rewards and track stars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full">
                Manage Rewards
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure app preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" variant="secondary" className="w-full">
                Open Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ParentGate>
  );
}
