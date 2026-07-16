# 黑马记账 (heima-accounting)

A lightweight personal accounting app — desktop (Electron) first, with a mobile build path (Capacitor). Designed for easy local bookkeeping and simple statistics.

## What this is
A cross-platform personal bookkeeping application implemented as an Electron + React desktop app with an option to build a mobile shell via Capacitor. It stores data locally (sql.js) and provides pages for adding records, viewing lists, statistics, and settings.

### Stack
- **Language(s):** TypeScript, JavaScript
- **Framework / runtime:** Electron (desktop) + React (renderer) + Vite (dev/build). Capacitor for mobile builds.
- **Notable libraries:** Ant Design (UI), sql.js (SQLite-in-browser), ECharts (charts), Zustand (state), React Router

## How it's organized
Top-level important files and directories:
```
package.json                # scripts & deps (dev/build/dist/mobile scripts)
electron.vite.config.ts     # electron + vite config
electron-builder.yml       # packaging config
vite.mobile.config.ts      # mobile build config
capacitor.config.ts        # Capacitor config (mobile)
android/                   # Android project for Capacitor
src/
  main/                    # Electron main process (app lifecycle, database)
    index.ts
    database.ts            # sql.js-based DB logic and migrations
  preload/                 # Preload script exposing safe APIs to renderer
    index.ts
  renderer/                # React app (UI)
    App.tsx
    pages/                 # AddRecord, RecordList, Statistics, Settings pages
    store/                 # zustand stores (useStore)
    components/            # shared components like ErrorBoundary
  shared/                  # shared types (src/shared/types.ts)
build-portable.sh          # helper script to build portable releases
```

How it fits together:
- The Electron main process (src/main) boots the app, initializes a local sql.js database (src/main/database.ts), and registers IPC or context-bridge handlers.
- The preload script (src/preload/index.ts) exposes a minimal, secure API to the renderer.
- The renderer (src/renderer) is a React SPA (Vite) using Ant Design for UI, zustand for state, and ECharts for charts. Pages communicate with main via the preload API.

## How to run it

Prerequisites:
- Node.js (recommended 18+)
- npm (or compatible package manager)
- For mobile builds: Capacitor prerequisites (Android Studio / Xcode for respective platforms)

Install dependencies:
```bash
npm ci
# or
npm install
```

Run desktop in development (hot-reload):
```bash
npm run dev
```

Build desktop (production) and package:
```bash
# build renderer & main artifacts
npm run build

# package into directory
npm run pack

# build and create distributable installers
npm run dist
```

Preview a production build locally:
```bash
npm run preview
```

Mobile (Capacitor) flow (generate a mobile web build, then sync with native projects):
```bash
# produce mobile web build
npm run mobile:build

# sync web assets into Capacitor native projects
npm run mobile:sync

# add platforms (one-time)
npm run mobile:add:android
npm run mobile:add:ios

# open android studio / Xcode
npm run mobile:open:android
npm run mobile:open:ios
```

Notes:
- The repository uses sql.js for local storage and stores DB logic in src/main/database.ts.
- Building installers requires the native tooling and signing configuration per electron-builder settings (see electron-builder.yml).

## Contributing
- Open issues for bugs or feature requests.
- Submit PRs against the default branch; keep changes focused and include a short description.
- If you change DB schema or migrations, update src/main/database.ts accordingly.

## Try asking
- Where is the persistence and migration logic implemented? (see src/main/database.ts)
- How does the renderer call native APIs — where is the context bridge defined? (see src/preload/index.ts)
- Which UI pages implement export/import or backup of the database, and are these wired for mobile builds?
