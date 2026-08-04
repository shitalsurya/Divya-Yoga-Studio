---
name: Divya Yoga PWA architecture
description: Key decisions for auth flow, i18n, push notifications, phone-frame removal, and backend wiring in the Divya Yoga Studio app.
---

## Phone frame removal
The fake device frame in `main-app.jsx` was replaced with `height:100dvh` on the root div. Body background is `#2A2420` (dark neutral for wide screens). `#root` is `max-width:480px; height:100dvh`. `prototype.html` had a `@media(min-width:600px)` phone-frame block — removed; `.device` now fills full viewport width. `CreamHeader` uses `paddingTop: max(12px, env(safe-area-inset-top))`.

**Why:** App was showing a fake phone-in-browser chrome; needed a real PWA shell for standalone install.

## i18n
Three files in `src/i18n/`: `en.json`, `hi.json`, `mr.json`. Context in `LanguageContext.tsx` exposes `{ lang, setLang, translate }`. Persisted to `localStorage` key `divya_yoga_lang`. `LanguageProvider` wraps the whole app in `App.tsx`. `translate(key)` falls back to English if key missing. Tab labels use `translate(\`nav_${t.id}\`)` in the MainApp tab bar.

## Push notifications
`src/lib/notifications.ts` exports `requestPermission()`, `showNotification(type)`, `sendTestNotifications()`. Uses `registration.showNotification()` via the SW; falls back to direct `new Notification()`. Four types: `batch_reminder`, `workshop_confirmed`, `waitlist_opened`, `streak_nudge`. Debug test button in `NotificationPreferencesScreen` shown only when `localStorage.divya_debug === "true"`. SW's `notificationclick` handler posts `{ type: 'notification-action', action }` to focus open app windows.

## Auth flow (prototype.html → API → SignInScreen)
`prototype.html` now has 12 steps (was 11). New step 11 = UPI Payment screen. Step 12 = Confirmation.

- Booking screen (10): collects name, mobile (10-digit Indian regex `/^[6-9]\d{9}$/`), 4-digit PIN, consent.
- UPI Payment screen (11): client-side QR via `qrcode@1.5.4` CDN, UPI link `upi://pay?pa=9356681834@okbizaxis&...`, copyable UPI ID pill, "I've completed payment" CTA.
- Confirmation screen (12): `populateConfirmation()` is async — fires `POST /api/auth/signup` → `POST /api/bookings` → `POST /api/payments/mark-paid` → `POST /api/whatsapp/add-to-group` (regular only, non-fatal). Button label changes to "Setting up your account…" while in flight.
- `goToHome()` on Confirmation sends postMessage with name/mobile/pin in the onboarding payload.
- `App.tsx` always routes to `SignInScreen` after onboarding (no auto-login). SignInScreen pre-fills mobile from `onboardingData.mobile`.
- `SignInScreen.tsx` is signin-only (no signup mode). Calls `POST /api/auth/signin`. Stores JWT in `divya_yoga_session`, user in `divya_yoga_user`.

**Why:** Explicit sign-in after account creation prevents silent auto-login and teaches users their credentials.

## Enrolled batch lookup (Home screen)
`selectSlot()` in `prototype.html` now includes `id: el.dataset.id` in `state.slot` so slot IDs ("s1"–"s5") flow through to `divya_yoga_onboarding_data.slot.id` in localStorage and to `POST /api/bookings` as `slotId`.
`main-app.jsx` has `SLOT_ID_TO_BATCH_ID = { s1:1, s2:2, s3:3, s4:5, s5:4 }` and `getEnrolledBatchId()` that reads from localStorage. `MainApp` derives `enrolledBatchId` on mount and passes it to `HomeScreen` and `BatchDetail` as props.

**Why:** Pre-fix, `selectSlot` set `state.slot = { time, mode, batch }` without `id`, so `state.slot.id` was always undefined → batchId always null in bookings → wrong batch shown on Home screen.
**Note:** Users who completed onboarding before this fix have `batch_id: null` in their bookings row. They need to re-book to get session generation.

## Backend (api-server)
Routes: `POST /api/auth/signup`, `POST /api/auth/signin`, `POST /api/bookings`, `POST /api/payments/mark-paid`, `POST /api/whatsapp/add-to-group`, `GET /api/practice/summary`.
- Passwords: bcryptjs with 12 rounds. Never store/transmit PIN in plaintext.
- JWT: jose `HS256`, `SESSION_SECRET` env var, 30-day expiry.
- Auth middleware: `requireAuth` in `src/middlewares/auth.ts`.
- WhatsApp: Meta Cloud API v22.0, group IDs from `WA_GROUP_s1`…`WA_GROUP_s5` env vars, token from `WHATSAPP_API_TOKEN`. Failure is non-fatal (returns `{ success: false, reason }` not 500).

## Session generation (booking_sessions)
`artifacts/api-server/src/lib/session-generator.ts` — `generateUpcomingSessions({ userId, bookingId, batchId, windowDays=28 })`.
- Generates one `booking_sessions` row per weekday (Mon–Fri, matching TIMETABLE in main-app.jsx) for the next 28 calendar days.
- Idempotent: queries existing dates in window before inserting, only inserts missing ones.
- Called from `POST /api/bookings` (blocking) when `slotId` is non-null.
- Called from `GET /api/practice/summary` as fire-and-forget top-up to keep rolling window fresh.

`artifacts/api-server/src/lib/seed-batches.ts` — seeds s1–s5 into the `batches` table on server startup (`onConflictDoNothing`). Called from `index.ts` before `app.listen`.

**Why:** No cron/scheduled job infrastructure exists; Practice-tab top-up on each view is sufficient for a small studio and keeps infrastructure minimal.

## DB schema (Drizzle + Postgres)
Five tables: `users`, `batches`, `bookings`, `booking_sessions`, `payments`. See `lib/db/src/schema/`. Run `pnpm --filter @workspace/db run push` to apply migrations.
`batches` rows are seeded at API server startup via `seed-batches.ts` (idempotent). Without these rows the FK on `booking_sessions.batch_id` would block all session inserts.

## API client setup
`setAuthTokenGetter(() => getSessionToken())` called in `App.tsx` useEffect so all orval-generated hooks automatically send Bearer tokens. `getSessionToken()` reads from `localStorage.divya_yoga_session`.

## Vite proxy
`/api` proxied to `http://localhost:8080` in `vite.config.ts` — needed so `prototype.html` (served by the Vite dev server) can call the API server in development.

## Key localStorage keys
- `divya_yoga_onboarding_complete` — "true" when onboarding done
- `divya_yoga_session` — JWT session token (replaces old divya_yoga_user as auth signal)
- `divya_yoga_user` — JSON DivyaUser object (name/mobile/joinedAt)
- `divya_yoga_onboarding_data` — JSON onboarding selections including `slot: { id, time, mode, batch }`
- `divya_yoga_lang` — "en" | "hi" | "mr"
- `divya_debug` — set to "true" to reveal notification test button

## TS typecheck note
`pnpm typecheck` in api-server shows "Output file not built" errors for lib packages — pre-existing workspace pattern; lib packages have no `build` script, consumed directly by esbuild at bundle time. Runtime is unaffected.
