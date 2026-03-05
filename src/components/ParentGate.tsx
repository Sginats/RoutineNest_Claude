"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const HOLD_MS = 3000;
const TICK_INTERVAL_MS = 50;
/** How long (ms) the gate stays unlocked before requiring a re-hold. */
const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const STORAGE_KEY = "routinenest_parent_unlocked_until";

interface ParentGateProps {
  children: React.ReactNode;
}

/**
 * Hold-to-enter gate that guards parent-only content.
 * The user must press and hold a large button for 3 seconds to unlock.
 * Releasing early resets progress. Works fully offline (no server calls).
 * The gate stays unlocked for 10 minutes, after which a re-hold is required.
 */
export default function ParentGate({ children }: ParentGateProps) {
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    const until = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    return Date.now() < until;
  });
  const [progress, setProgress] = useState(0); // 0–100
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Expire session when the stored timeout elapses
  useEffect(() => {
    if (!unlocked) return;
    const until = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    const remaining = until - Date.now();
    if (remaining <= 0) {
      const t = setTimeout(() => setUnlocked(false), 0);
      return () => clearTimeout(t);
    }
    const id = setTimeout(() => setUnlocked(false), remaining);
    return () => clearTimeout(id);
  }, [unlocked]);

  // Sync lock state across tabs: if another tab clears or expires the key, lock here too
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      const until = Number(e.newValue ?? 0);
      if (Date.now() >= until) setUnlocked(false);
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handlePointerDown = useCallback(() => {
    if (unlocked) return;

    startRef.current = Date.now();
    setProgress(0);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min((elapsed / HOLD_MS) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        clearTimer();
        localStorage.setItem(
          STORAGE_KEY,
          String(Date.now() + SESSION_TIMEOUT_MS),
        );
        setUnlocked(true);
      }
    }, TICK_INTERVAL_MS);
  }, [unlocked, clearTimer]);

  const handlePointerUp = useCallback(() => {
    if (unlocked) return;
    clearTimer();
    setProgress(0);
  }, [unlocked, clearTimer]);

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <p className="text-lg text-muted-foreground text-center">
        Press and hold the button to access this area
      </p>

      <button
        type="button"
        className="relative w-64 h-20 rounded-2xl border-2 border-primary bg-primary/10 text-primary font-semibold text-xl select-none touch-none overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label="Hold to unlock parent area"
      >
        {/* Progress fill */}
        <span
          className="absolute inset-0 bg-primary/20 origin-left transition-none"
          style={{ transform: `scaleX(${progress / 100})` }}
          aria-hidden="true"
        />
        {/* Label */}
        <span className="relative z-10">
          {progress > 0 && progress < 100
            ? `Hold… ${Math.round((HOLD_MS * (1 - progress / 100)) / 1000)}s`
            : "Hold to Enter"}
        </span>
      </button>

      {/* Accessible progress for screen readers */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Unlock progress"
        aria-live="polite"
        className="sr-only"
      />
    </div>
  );
}
