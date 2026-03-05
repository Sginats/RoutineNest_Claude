"use client";

import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useState, useEffect } from "react";
import { createIdbPersister } from "@/lib/queryPersistence";
import { replayQueue } from "@/lib/syncQueue";

// ---------------------------------------------------------------------------
// SyncManager — replays the offline mutation queue when the browser comes
// back online, then invalidates all queries so the UI picks up server state.
// ---------------------------------------------------------------------------
function SyncManager() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Replay any leftover mutations from previous sessions
    replayQueue().catch((err) =>
      console.error("[SyncManager] replay on mount failed:", err),
    );

    function handleOnline() {
      replayQueue().then((n) => {
        if (n > 0) queryClient.invalidateQueries();
      });
    }

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [queryClient]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 1000 * 60 * 60 * 24, // 24 h – keep cache for offline use
          },
        },
      }),
  );

  const [persister] = useState(() => createIdbPersister());

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <SyncManager />
      {children}
    </PersistQueryClientProvider>
  );
}
