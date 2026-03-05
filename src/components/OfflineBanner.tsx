"use client";

import { useState, useEffect } from "react";

/**
 * A gentle banner displayed when the device is offline.
 * Non-scary, kid-friendly copy. Disappears automatically when back online.
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    function goOffline() {
      setIsOffline(true);
    }
    function goOnline() {
      setIsOffline(false);
    }

    // Subscribe to online/offline events
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    // Check initial state via a microtask to satisfy lint
    const id = setTimeout(() => setIsOffline(!navigator.onLine), 0);

    return () => {
      clearTimeout(id);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 bg-secondary px-4 py-2 text-center text-sm font-semibold text-secondary-foreground"
    >
      <span aria-hidden="true">📡</span>
      <span>Offline mode — your progress is saved!</span>
    </div>
  );
}
