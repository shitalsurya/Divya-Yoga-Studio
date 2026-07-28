---
name: Divya Yoga PWA architecture
description: Key decisions for auth flow, i18n, push notifications, and phone-frame removal in the Divya Yoga Studio app.
---

## Phone frame removal
The fake device frame in `main-app.jsx` was replaced with `height:100dvh` on the root div. Body background is `#2A2420` (dark neutral for wide screens). `#root` is `max-width:480px; height:100dvh`. `prototype.html` had a `@media(min-width:600px)` phone-frame block — removed; `.device` now fills full viewport width. `CreamHeader` uses `paddingTop: max(12px, env(safe-area-inset-top))`.

**Why:** App was showing a fake phone-in-browser chrome; needed a real PWA shell for standalone install.

## i18n
Three files in `src/i18n/`: `en.json`, `hi.json`, `mr.json`. Context in `LanguageContext.tsx` exposes `{ lang, setLang, translate }`. Persisted to `localStorage` key `divya_yoga_lang`. `LanguageProvider` wraps the whole app in `App.tsx`. `translate(key)` falls back to English if key missing in target language. Tab labels use `translate(\`nav_${t.id}\`)` in the MainApp tab bar.

**Why:** Audience is Indian students; Hindi and Marathi cover the two most common regional languages.

## Push notifications
`src/lib/notifications.ts` exports `requestPermission()`, `showNotification(type)`, `sendTestNotifications()`. Uses `registration.showNotification()` via the SW; falls back to direct `new Notification()`. Four types: `batch_reminder`, `workshop_confirmed`, `waitlist_opened`, `streak_nudge`. Debug test button in `NotificationPreferencesScreen` shown only when `localStorage.divya_debug === "true"`. SW's `notificationclick` handler posts `{ type: 'notification-action', action }` to open app windows.

**Why:** Real OS-level notifications require SW; direct `Notification` constructor only works in foreground.

## Auth flow
`App.tsx` has three states: `onboarding → signin → app`. State derived on load from `localStorage`. `getStoredUser()` in `src/auth/SignInScreen.tsx` returns user or null. After onboarding postMessage, if user exists → skip to `app`, else → `signin`. Onboarding data sent as `event.data.onboarding` from `prototype.html`'s `goToHome()`. Stored under `divya_yoga_onboarding_data`. `SignInScreen` is a mock — any name+contact creates an account; signin requires a 4-digit PIN (any 4 digits accepted).

**Why:** No real auth backend exists; flow demonstrates the UX shape without backend dependency.

## Key localStorage keys
- `divya_yoga_onboarding_complete` — "true" when onboarding done
- `divya_yoga_user` — JSON DivyaUser object
- `divya_yoga_onboarding_data` — JSON onboarding selections
- `divya_yoga_lang` — "en" | "hi" | "mr"
- `divya_debug` — set to "true" to reveal debug test button
