# Archana's Divya Yoga Studio

A PWA for Archana's Divya Yoga Studio — an 11-step onboarding experience leading into the main yoga app, installable and offline-capable.

## Run & Operate

- Workflows are managed by Replit — use the workflow panel to start/stop
- `artifacts/divya-yoga: web` — Vite dev server for the React frontend (port 23739, served at `/`)
- `artifacts/api-server: API Server` — Express 5 API server (port 8080, served at `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes to dev (dev only)
- `DATABASE_URL` is auto-provisioned by Replit — do not set manually

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- Frontend: React 18 + Vite + Tailwind CSS + shadcn/ui, served at `/`
- API: Express 5, served at `/api`
- DB: PostgreSQL + Drizzle ORM (schema in `lib/db/src/schema/`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle for API server)
- PWA: Service worker at `artifacts/divya-yoga/public/sw.js`, manifest at `public/manifest.webmanifest`

## Where things live

- `artifacts/divya-yoga/src/App.tsx` — root component; manages onboarding vs. main app state
- `artifacts/divya-yoga/public/prototype.html` — 11-step onboarding prototype (standalone HTML)
- `artifacts/divya-yoga/public/sw.js` — service worker (app-shell caching + offline fallback)
- `artifacts/divya-yoga/public/manifest.webmanifest` — PWA manifest
- `artifacts/divya-yoga/src/main-app/` — main app shell (post-onboarding)
- `lib/db/src/schema/` — Drizzle table definitions (source of truth for DB schema)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)
- `artifacts/api-server/src/routes/` — Express route handlers

## Architecture decisions

- Onboarding is a self-contained HTML prototype (`prototype.html`) rendered in an iframe; it posts a `divya-yoga-onboarding-complete` message to unlock the main app shell.
- `divya_yoga_onboarding_complete` key in `localStorage` persists onboarding state so returning users skip straight to the main app.
- Service worker uses an app-shell caching strategy: shell assets cached on install, dynamic assets cached on first fetch, offline fallback page returned for navigation requests.
- PWA install prompt captured via `beforeinstallprompt` and surfaced as an in-app button.

## Product

Archana's Divya Yoga Studio app: users complete an 11-step personalized onboarding flow, then access the main yoga studio experience. Installable as a PWA and functional offline for cached routes and assets.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `DATABASE_URL` is runtime-managed by Replit — never set it manually; `setEnvVars` will reject it.
- The service worker caches `./prototype.html` as part of the app shell — any rename must update `sw.js`.
- Restarting the `artifacts/api-server: API Server` workflow triggers a full esbuild rebuild before starting.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
