# QA Checklist — RoutineNest

Manual QA checks to run before every release candidate. Mark each item ✅ or ❌.

---

## 1. Offline Functionality

- [ ] **Schedule loads offline** — Turn on airplane mode, kill app, reopen. Visual schedule displays cached items.
- [ ] **AAC Talk Board loads offline** — All cards render from persisted TanStack Query cache (IDB).
- [ ] **TTS works offline** — Tapping a card speaks via Capacitor native TTS (or Web Speech API on web). No network required.
- [ ] **Completing a schedule item offline** — Tap a step; it marks done locally. Sync queue entry created in IDB (`routinenest_sync_queue`).
- [ ] **Sync queue replays on reconnect** — Restore network; pending mutations are flushed to Supabase within a few seconds.
- [ ] **No crash on first offline launch** — If the device has never been online with this profile, show an appropriate empty/loading state rather than crashing.
- [ ] **Parent edits enqueue offline** — Create/edit a card or schedule step while offline; changes persist locally and sync when back online.

---

## 2. Accessibility

- [ ] **Touch target size** — All interactive buttons/cards are at least 44 × 44 pt (iOS HIG) / 48 × 48 dp (Android).
- [ ] **Color contrast** — Text and icon colors meet WCAG AA (4.5 : 1 for normal text, 3 : 1 for large text) in both light and calm-mode themes.
- [ ] **Focus order** — Tab/keyboard navigation follows a logical reading order on every page.
- [ ] **Screen reader labels** — All icon-only buttons have `aria-label`. Cards have meaningful `alt` text on images.
- [ ] **Big-button mode (grid 2)** — Cards are visibly larger; no text truncation on short labels.
- [ ] **Reduced motion** — When Calm Mode is enabled, animations are reduced or disabled (`prefers-reduced-motion` respected).
- [ ] **TTS feedback** — Tapping a card speaks the label (or `tts_text` if set) clearly via native or Web Speech fallback.
- [ ] **AAC board keyboard/switch access** — Cards are reachable without a pointer on web.

---

## 3. Parent Lock

- [ ] **Hold-to-enter gate appears** — Navigating to `/parent` or `/settings` shows the 3-second hold progress UI before granting access.
- [ ] **Short tap rejected** — Releasing the hold button before 3 s does not open the protected page.
- [ ] **Gate persists after background** — Returning from background re-requires the hold gesture (no stale unlock state).
- [ ] **Parent lock toggle** — Disabling `parent_lock_enabled` in Settings bypasses the hold gate; re-enabling restores it.
- [ ] **No route bypass** — Direct URL navigation to `/parent` or `/settings` still shows the gate (not bypassed by typing the URL).

---

## 4. Calm Mode

- [ ] **Calm Mode toggle** — Enabling Calm Mode in Settings immediately applies the softer UI theme without a full reload.
- [ ] **Reduced animations** — Transitions and entrance animations are removed or slowed; no bouncy or surprise motion.
- [ ] **No surprise sounds** — Completion sounds and non-essential audio are silenced when `calm_mode` is on.
- [ ] **TTS still works** — Speech output continues to function (calm mode mutes *incidental* sounds, not TTS).
- [ ] **Visual softness** — Colours appear muted/pastel; no high-saturation accents that could be over-stimulating.
- [ ] **Setting persists** — Calm Mode state survives app restart (stored in Supabase `settings` table; optimistic cache on device).

---

## 5. Performance

- [ ] **Schedule page initial paint < 2 s** on a mid-range Android device (cold start, data cached offline).
- [ ] **AAC board initial paint < 2 s** — Same conditions as above.
- [ ] **No jank on card reorder** — Dragging / Up/Down reordering in the Parent dashboard is smooth (60 fps).
- [ ] **Image loading** — Custom card icons load promptly; no layout shift once loaded. Large uploaded images are not causing memory pressure.
- [ ] **TanStack Query cache** — Switching between Kid and Parent views does not trigger unnecessary network requests (cache hit confirmed in devtools).
- [ ] **IDB sync queue does not grow unbounded** — After coming online, processed mutations are removed from `routinenest_sync_queue`.
- [ ] **Bundle size** — `next build` completes without warnings about chunks exceeding 500 kB after gzip.
- [ ] **Capacitor WebView memory** — App stays resident in memory for 5 min of normal use without a crash (test on low-RAM device if available).
