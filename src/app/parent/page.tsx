"use client";

import { useState, useCallback } from "react";
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
import {
  getProfiles,
  createProfile,
  getCards,
  upsertCard,
  softDeleteCard,
  getSchedules,
  createSchedule,
  getScheduleItems,
  upsertScheduleItem,
  deleteScheduleItem,
} from "@/lib/db";
import {
  getActiveProfileId,
  setActiveProfileId,
} from "@/lib/profileStore";
import type {
  Profile,
  Card as CardType,
  Schedule,
  ScheduleItem,
} from "@/lib/types";

// ============================================================================
// Cards Editor
// ============================================================================
function CardsEditor({ profileId }: { profileId: string }) {
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading } = useQuery<CardType[]>({
    queryKey: ["cards", profileId],
    queryFn: () => getCards(profileId),
  });

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [ttsText, setTtsText] = useState("");
  const [category, setCategory] = useState<"task" | "aac">("task");
  const [imageUrl, setImageUrl] = useState("");

  function resetForm() {
    setEditingId(null);
    setLabel("");
    setTtsText("");
    setCategory("task");
    setImageUrl("");
  }

  function startEdit(card: CardType) {
    setEditingId(card.id);
    setLabel(card.label);
    setTtsText(card.tts_text ?? "");
    setCategory(card.category === "aac" ? "aac" : "task");
    setImageUrl(card.image_url ?? "");
  }

  // Save (create or update)
  const saveMutation = useMutation({
    mutationFn: async () => {
      const maxPos = cards.reduce((m, c) => Math.max(m, c.position), -1);
      await upsertCard({
        ...(editingId ? { id: editingId } : {}),
        profile_id: profileId,
        label: label.trim(),
        tts_text: ttsText.trim() || null,
        category,
        image_url: imageUrl.trim() || null,
        position: editingId
          ? (cards.find((c) => c.id === editingId)?.position ?? maxPos + 1)
          : maxPos + 1,
        deleted_at: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards", profileId] });
      resetForm();
    },
  });

  // Delete (soft)
  const deleteMutation = useMutation({
    mutationFn: (cardId: string) => softDeleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards", profileId] });
      resetForm();
    },
  });

  // Reorder
  const reorderMutation = useMutation({
    mutationFn: async ({
      cardId,
      direction,
    }: {
      cardId: string;
      direction: "up" | "down";
    }) => {
      const idx = cards.findIndex((c) => c.id === cardId);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= cards.length) return;

      const current = cards[idx];
      const swap = cards[swapIdx];

      await Promise.all([
        upsertCard({
          id: current.id,
          profile_id: profileId,
          label: current.label,
          tts_text: current.tts_text,
          category: current.category,
          image_url: current.image_url,
          position: swap.position,
          deleted_at: null,
        }),
        upsertCard({
          id: swap.id,
          profile_id: profileId,
          label: swap.label,
          tts_text: swap.tts_text,
          category: swap.category,
          image_url: swap.image_url,
          position: current.position,
          deleted_at: null,
        }),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards", profileId] });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    saveMutation.mutate();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cards</CardTitle>
        <CardDescription>
          Create and manage AAC / task cards for this profile
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Card list */}
        {isLoading ? (
          <p className="text-muted-foreground">Loading cards…</p>
        ) : cards.length === 0 ? (
          <p className="text-muted-foreground">No cards yet. Create one below.</p>
        ) : (
          <ul className="flex flex-col gap-2" aria-label="Cards">
            {cards.map((card, idx) => (
              <li
                key={card.id}
                className="flex items-center gap-2 rounded-lg border p-3"
              >
                <span
                  className="inline-block rounded px-2 py-0.5 text-xs font-medium uppercase"
                  style={{
                    background:
                      card.category === "aac"
                        ? "var(--color-accent)"
                        : "var(--color-muted)",
                  }}
                >
                  {card.category}
                </span>
                <span className="flex-1 font-medium">{card.label}</span>

                {/* Reorder buttons */}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={idx === 0 || reorderMutation.isPending}
                  onClick={() =>
                    reorderMutation.mutate({
                      cardId: card.id,
                      direction: "up",
                    })
                  }
                  aria-label={`Move ${card.label} up`}
                >
                  ▲
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={
                    idx === cards.length - 1 || reorderMutation.isPending
                  }
                  onClick={() =>
                    reorderMutation.mutate({
                      cardId: card.id,
                      direction: "down",
                    })
                  }
                  aria-label={`Move ${card.label} down`}
                >
                  ▼
                </Button>

                {/* Edit */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(card)}
                  aria-label={`Edit ${card.label}`}
                >
                  Edit
                </Button>

                {/* Delete */}
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(card.id)}
                  aria-label={`Delete ${card.label}`}
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        )}

        {/* Create / edit form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">
            {editingId ? "Edit Card" : "New Card"}
          </h3>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="card-category">Type</Label>
            <div className="flex gap-2" id="card-category">
              <Button
                type="button"
                size="sm"
                variant={category === "task" ? "default" : "outline"}
                onClick={() => setCategory("task")}
                aria-pressed={category === "task"}
              >
                Task
              </Button>
              <Button
                type="button"
                size="sm"
                variant={category === "aac" ? "default" : "outline"}
                onClick={() => setCategory("aac")}
                aria-pressed={category === "aac"}
              >
                AAC
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="card-label">Label</Label>
            <Input
              id="card-label"
              placeholder="e.g. Brush Teeth"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="card-tts">TTS Text (optional)</Label>
            <Input
              id="card-tts"
              placeholder="Text spoken aloud (defaults to label)"
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="card-image">Image URL (optional)</Label>
            <Input
              id="card-image"
              placeholder="https://example.com/image.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={saveMutation.isPending || !label.trim()}
            >
              {saveMutation.isPending
                ? "Saving…"
                : editingId
                  ? "Update Card"
                  : "Add Card"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>

          {saveMutation.isError && (
            <p className="text-sm text-destructive">
              Could not save card. Please try again.
            </p>
          )}
          {deleteMutation.isError && (
            <p className="text-sm text-destructive">
              Could not delete card. Please try again.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Schedule Builder
// ============================================================================
function ScheduleBuilder({ profileId }: { profileId: string }) {
  const queryClient = useQueryClient();

  // Schedules
  const { data: schedules = [], isLoading: schedulesLoading } = useQuery<
    Schedule[]
  >({
    queryKey: ["schedules", profileId],
    queryFn: () => getSchedules(profileId),
  });

  const [newTitle, setNewTitle] = useState("");

  const createMutation = useMutation({
    mutationFn: (title: string) => createSchedule(profileId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules", profileId] });
      setNewTitle("");
    },
  });

  // Use first schedule (MVP)
  const schedule = schedules[0] ?? null;

  // Items
  const { data: items = [], isLoading: itemsLoading } = useQuery<
    ScheduleItem[]
  >({
    queryKey: ["scheduleItems", schedule?.id],
    queryFn: () => getScheduleItems(schedule!.id),
    enabled: !!schedule,
  });

  // Task cards (only task-type cards can be added to schedules)
  const { data: taskCards = [] } = useQuery<CardType[]>({
    queryKey: ["cards", profileId, "task"],
    queryFn: () => getCards(profileId, "task"),
  });

  // All cards for label lookup
  const { data: allCards = [] } = useQuery<CardType[]>({
    queryKey: ["cards", profileId],
    queryFn: () => getCards(profileId),
  });
  const cardMap = new Map<string, CardType>();
  allCards.forEach((c) => cardMap.set(c.id, c));

  // Add item
  const addItemMutation = useMutation({
    mutationFn: async (cardId: string) => {
      if (!schedule) return;
      const maxPos = items.reduce((m, i) => Math.max(m, i.position), -1);
      await upsertScheduleItem({
        schedule_id: schedule.id,
        card_id: cardId,
        position: maxPos + 1,
        is_complete: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["scheduleItems", schedule?.id],
      });
    },
  });

  // Delete item
  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => deleteScheduleItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["scheduleItems", schedule?.id],
      });
    },
  });

  // Reorder item
  const reorderItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      direction,
    }: {
      itemId: string;
      direction: "up" | "down";
    }) => {
      const idx = items.findIndex((i) => i.id === itemId);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= items.length) return;

      const current = items[idx];
      const swap = items[swapIdx];

      await Promise.all([
        upsertScheduleItem({
          id: current.id,
          schedule_id: current.schedule_id,
          card_id: current.card_id,
          position: swap.position,
          is_complete: current.is_complete,
        }),
        upsertScheduleItem({
          id: swap.id,
          schedule_id: swap.schedule_id,
          card_id: swap.card_id,
          position: current.position,
          is_complete: swap.is_complete,
        }),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["scheduleItems", schedule?.id],
      });
    },
  });

  const handleCreateSchedule = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = newTitle.trim();
      if (!trimmed) return;
      createMutation.mutate(trimmed);
    },
    [newTitle, createMutation],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Builder</CardTitle>
        <CardDescription>
          Build a daily routine from task cards
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {schedulesLoading ? (
          <p className="text-muted-foreground">Loading schedules…</p>
        ) : !schedule ? (
          /* No schedule yet — create one */
          <form
            onSubmit={handleCreateSchedule}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="schedule-title">Schedule title</Label>
              <Input
                id="schedule-title"
                placeholder="e.g. Morning Routine"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                maxLength={100}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={createMutation.isPending || !newTitle.trim()}
            >
              {createMutation.isPending ? "Creating…" : "Create Schedule"}
            </Button>
          </form>
        ) : (
          /* Schedule exists — show items + add from task cards */
          <>
            <h3 className="text-lg font-semibold">{schedule.title}</h3>

            {/* Current items */}
            {itemsLoading ? (
              <p className="text-muted-foreground">Loading items…</p>
            ) : items.length === 0 ? (
              <p className="text-muted-foreground">
                No items yet. Add task cards below.
              </p>
            ) : (
              <ol className="flex flex-col gap-2" aria-label="Schedule items">
                {items.map((item, idx) => {
                  const card = cardMap.get(item.card_id);
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 rounded-lg border p-3"
                    >
                      <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <span className="flex-1 font-medium">
                        {card?.label ?? "Unknown card"}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={idx === 0 || reorderItemMutation.isPending}
                        onClick={() =>
                          reorderItemMutation.mutate({
                            itemId: item.id,
                            direction: "up",
                          })
                        }
                        aria-label={`Move item ${idx + 1} up`}
                      >
                        ▲
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={
                          idx === items.length - 1 ||
                          reorderItemMutation.isPending
                        }
                        onClick={() =>
                          reorderItemMutation.mutate({
                            itemId: item.id,
                            direction: "down",
                          })
                        }
                        aria-label={`Move item ${idx + 1} down`}
                      >
                        ▼
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleteItemMutation.isPending}
                        onClick={() => deleteItemMutation.mutate(item.id)}
                        aria-label={`Remove ${card?.label ?? "item"}`}
                      >
                        ✕
                      </Button>
                    </li>
                  );
                })}
              </ol>
            )}

            {/* Add from task cards */}
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold">Add task card</h4>
              {taskCards.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Create task-type cards above first.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {taskCards.map((card) => (
                    <Button
                      key={card.id}
                      variant="outline"
                      size="sm"
                      disabled={addItemMutation.isPending}
                      onClick={() => addItemMutation.mutate(card.id)}
                      aria-label={`Add ${card.label} to schedule`}
                    >
                      + {card.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {addItemMutation.isError && (
              <p className="text-sm text-destructive">
                Could not add item. Please try again.
              </p>
            )}
            {deleteItemMutation.isError && (
              <p className="text-sm text-destructive">
                Could not remove item. Please try again.
              </p>
            )}
          </>
        )}

        {createMutation.isError && (
          <p className="text-sm text-destructive">
            Could not create schedule. Please try again.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Parent Page
// ============================================================================
export default function ParentPage() {
  const { user, loading, logout } = useRequireAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- active profile stored in localStorage ---
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

        {/* Editors — only when a profile is selected */}
        {activeProfile && (
          <>
            {/* Cards Editor */}
            <CardsEditor profileId={activeProfile.id} />

            {/* Schedule Builder */}
            <ScheduleBuilder profileId={activeProfile.id} />
          </>
        )}

        {/* Quick nav cards */}
        <div className="grid gap-6 sm:grid-cols-2">
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
              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                onClick={() => router.push("/settings")}
              >
                Open Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ParentGate>
  );
}
