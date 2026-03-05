# Release Checklist — RoutineNest

Step-by-step checklist for cutting a production release. Work through every section in order.

---

## 1. Pre-Release Checks

- [ ] All items in **QA_CHECKLIST.md** are ✅.
- [ ] No open `P0`/`P1` bugs in the issue tracker.
- [ ] `main` branch CI is green (lint + build).
- [ ] `CHANGELOG` / release notes drafted.
- [ ] Version number bumped in `package.json` (and `capacitor.config.ts` if needed).

---

## 2. Web Build

- [ ] `npm run build` completes without errors.
  - Uses `next build --webpack` (required for PWA / workbox plugin — do **not** use Turbopack).
- [ ] Static export in `out/` directory is present.
- [ ] PWA manifest and service-worker files (`sw.js`, `workbox-*.js`) generated in `public/` / `out/`.
- [ ] `manifest.json` contains correct `name`, `short_name`, `icons`, `start_url`, `display: standalone`.
- [ ] Smoke-test deployed web build in Chrome (desktop) and Safari Mobile (add-to-home-screen PWA).

---

## 3. Capacitor Sync

- [ ] `npm run cap:build` succeeds (runs `npm run build` then `npx cap copy`).
- [ ] `npx cap sync` completes — native dependencies updated in `android/` and `ios/`.
- [ ] No unresolved peer-dependency warnings from Capacitor plugins.

---

## 4. Android Release

- [ ] Open Android project: `npm run cap:open:android`.
- [ ] **Build variant** set to `release` in Android Studio.
- [ ] Signing config applied (keystore path, alias, passwords set via environment or `local.properties` — **never commit secrets**).
- [ ] `versionCode` and `versionName` updated in `android/app/build.gradle`.
- [ ] Run on physical device (or emulator API 29+): `npm run cap:run:android`.
- [ ] **Functional smoke test** on device:
  - [ ] App launches and reaches Kid home screen.
  - [ ] Schedule loads (online and offline).
  - [ ] AAC card speaks via native TTS.
  - [ ] Parent gate hold works.
- [ ] Generate signed AAB (`Build → Generate Signed Bundle / APK`).
- [ ] Upload AAB to Google Play Console internal testing track.
- [ ] Verify Play Console does not flag missing permissions or policy violations.

---

## 5. iOS Release

- [ ] Open iOS project: `npm run cap:open:ios`.
- [ ] **Scheme** set to release / `Any iOS Device`.
- [ ] Bundle ID matches `com.routinenest.app` (in Xcode → Signing & Capabilities).
- [ ] Signing certificate and provisioning profile valid and not expired.
- [ ] `CFBundleShortVersionString` and `CFBundleVersion` updated in `Info.plist`.
- [ ] Run on physical device via Xcode: `npm run cap:run:ios`.
- [ ] **Functional smoke test** on device:
  - [ ] App launches and reaches Kid home screen.
  - [ ] Schedule loads (online and offline).
  - [ ] AAC card speaks via native TTS.
  - [ ] Parent gate hold works.
- [ ] Archive and upload to App Store Connect (`Product → Archive`).
- [ ] App Store Connect shows no binary errors or missing compliance answers.
- [ ] Answer **Export Compliance** — does the app use encryption beyond HTTPS? (Typically: No for standard TLS.)

---

## 6. Privacy & Data Notes

- [ ] **Supabase RLS** — confirm Row-Level Security policies are enabled on all tables (`profiles`, `cards`, `schedules`, `schedule_items`, `rewards`, `settings`). Verify in the Supabase dashboard under **Authentication → Policies** (each table should show RLS enabled and at least one `auth.uid()` policy), or run `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';` in the SQL editor and confirm `rowsecurity = true` for every table. No row should be readable by a user other than the owner.
- [ ] **PostHog analytics opt-out** — confirm the opt-out toggle in Settings writes to `localStorage` key `routinenest_analytics_enabled=false` and PostHog is not initialised when the value is `false`.
- [ ] **No PII in analytics** — verify `trackScreen`, `trackScheduleItemCompleted`, and `trackAACCardTapped` events contain only opaque IDs, never names or photos.
- [ ] **Session replay disabled** — PostHog session replay must remain disabled (verify in `src/lib/analytics.ts` — `disable_session_recording: true` or equivalent).
- [ ] **Storage bucket access** — `card-icons` Supabase Storage bucket is **not** public; objects are accessible only via signed URLs scoped to the owning user.
- [ ] **No secrets in source** — grep for API keys / service role keys; none should be in committed files. `.env.local` is in `.gitignore`.
- [ ] **Privacy Policy / App Store data disclosure** — ensure the app's privacy policy URL is set in both Google Play Console and App Store Connect, and the data-use declarations are accurate.
- [ ] **Child data (COPPA/GDPR-K)** — the app is used by/for children; confirm no advertising SDKs or third-party tracking beyond opted-in PostHog are included.

---

## 7. Post-Release

- [ ] Tag the release commit: `git tag vX.Y.Z && git push --tags`.
- [ ] Publish GitHub Release with changelog.
- [ ] Monitor Supabase logs and PostHog for errors in the first 24 h.
- [ ] Promote Android internal track → production (after soak period).
- [ ] Submit iOS build for App Store review.
