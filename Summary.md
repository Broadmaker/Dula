# SUMMARY.md — DULA

> Full session log — all files, decisions, fixes, and outcomes.
> Append a new session block at the end after every session.
> Never delete previous session entries.

---

## Session 001 — Planning & Architecture

**Date:** May 2026
**Goal:** Define all project docs before writing any code.

### What Was Done

- Reviewed original DULA pickleball scoring app roadmap
- Reviewed GLOBAL.md v3.3 and identified all conflicts
- Decided database: Firestore over Supabase (D-001)
- Closed all open architectural questions (D-001 through D-010)
- Pivoted Phase 1 to offline-first + social share card (D-009, D-010)
- Live sync deferred to Phase 3, visible toggle in Settings from Phase 1

### Files Created

| File                | Description                                                   |
| ------------------- | ------------------------------------------------------------- |
| `PROJECT.md`        | Main app doc — GLOBAL-compliant, all conflicts resolved       |
| `DECISIONS.md`      | D-001 through D-010 logged with full rationale                |
| `SCHEMA.md`         | Firestore collections, SQLite tables, indexes, security rules |
| `project.config.ts` | Session bootstrap file — feature flags, scoring constants     |
| `CONTEXT.md`        | Handoff note — next action points to Phase 1 bootstrap        |
| `tasks/todo.md`     | Full Phase 1 plan — 16 stages with checkable deliverables     |

### Key Decisions Made

| ID    | Decision                                                              |
| ----- | --------------------------------------------------------------------- |
| D-001 | Firestore over Supabase — native realtime + offline persistence       |
| D-002 | expo-sqlite Next API — mandated by GLOBAL.md                          |
| D-003 | NativeWind v4 only — React Native Paper dropped (StyleSheet conflict) |
| D-004 | React Navigation — no Expo Router ever                                |
| D-006 | Single Expo project — no monorepo until justified                     |
| D-007 | Phone layout only — tablet deferred                                   |
| D-008 | Web viewer in Phase 3                                                 |
| D-009 | Live sync off by default — opt-in toggle, functional in Phase 3       |
| D-010 | Phase 1 core loop: score locally → share image card to social         |

---

## Session 002 — Phase 1 Scaffold (Stages 1–11)

**Date:** May 2026
**Goal:** Bootstrap full project scaffold — nav, SQLite, stores, types, mocks, placeholder screens. Zero feature screens, zero Firebase. Verified clean on device.

### Stages Completed

| Stage | Description                                                               | Status  |
| ----- | ------------------------------------------------------------------------- | ------- |
| 1     | Expo project init, tsconfig, babel, EAS                                   | ✅ Done |
| 2     | All Phase 1 dependencies installed                                        | ✅ Done |
| 3     | Full folder structure scaffolded                                          | ✅ Done |
| 4     | Theme constants, scoring constants, tailwind config                       | ✅ Done |
| 5     | All TypeScript types defined                                              | ✅ Done |
| 6     | Logger, formatDate, shareCard utils                                       | ✅ Done |
| 7     | uiStore, activeMatchStore (Zustand)                                       | ✅ Done |
| 8     | SQLite schema + matchDb service                                           | ✅ Done |
| 9     | Mock data + mock hooks                                                    | ✅ Done |
| 10    | Full navigation scaffold — all stacks + MainTabs                          | ✅ Done |
| 11    | App.tsx bootstrap — SQLite, TanStack Query, fonts, NetInfo, OfflineBanner | ✅ Done |

### Files Created / Modified

**Config:**

- `tsconfig.json` — strict mode, `@/` path alias
- `babel.config.js` — NativeWind v4, module-resolver, reanimated
- `tailwind.config.js` — DULA color tokens
- `app.json` — Expo config
- `eas.json` — dev / preview / production profiles
- `project.config.ts` — session bootstrap, feature flags

**Types:**

- `src/types/base.types.ts` — `BaseEntity`, `SyncStatus`
- `src/types/event.types.ts` — `MatchEvent` union
- `src/types/match.types.ts` — `Match`, `Team`, `MatchType`, `MatchStatus`, `ScoreLimit`
- `src/types/user.types.ts` — `UserProfile`
- `src/types/tournament.types.ts` — `Tournament`, `Standing`, `Court`

**Constants:**

- `src/constants/theme.ts` — color tokens, font names
- `src/constants/scoring.ts` — `SCORE_LIMITS`, `MAX_TIMEOUTS_PER_TEAM`, `SIDE_SWITCH_THRESHOLD`
- `src/constants/firebase.ts` — collection name placeholders (Phase 2+)

**Utils:**

- `src/utils/logger.ts` — central logger, no console.log
- `src/utils/formatDate.ts` — ISO 8601 helpers
- `src/utils/shareCard.ts` — `buildShareCardData` pure function

**Stores:**

- `src/store/uiStore.ts` — `isOffline`, `toasts`, Crypto UUID for toast IDs
- `src/store/activeMatchStore.ts` — `applyEvent` atomic pattern, `MatchSnapshot` type

**Database:**

- `src/services/db/matchDb.ts` — WAL mode, full schema, `MatchRow` type, `mapRowToMatch`, all CRUD

**Mocks:**

- `src/mocks/match.mock.ts` — 3 realistic matches (2 completed, 1 active)
- `src/mocks/user.mock.ts` — 1 local user profile
- `src/hooks/useMatchMock.ts` — loading/error/empty state variants
- `src/hooks/useProfileMock.ts` — loading/error/empty state variants

**Navigation:**

- `src/navigation/types.ts` — all param lists, no composite helpers (v7)
- `src/navigation/RootNavigator.tsx` — mounts MainTabs directly (no auth gate Phase 1)
- `src/navigation/tabs/MainTabs.tsx` — 4 tabs (Analytics hidden until Phase 3)
- `src/navigation/stacks/HomeStack.tsx`
- `src/navigation/stacks/MatchStack.tsx`
- `src/navigation/stacks/HistoryStack.tsx`
- `src/navigation/stacks/ProfileStack.tsx`

**Placeholder Screens:**

- `src/screens/Home/DashboardScreen.tsx`
- `src/screens/Home/MatchSetupScreen.tsx`
- `src/screens/Match/LiveScoringScreen.tsx`
- `src/screens/Match/MatchSummaryScreen.tsx`
- `src/screens/Match/ShareCardScreen.tsx`
- `src/screens/History/MatchHistoryScreen.tsx`
- `src/screens/History/MatchDetailScreen.tsx`
- `src/screens/Profile/ProfileScreen.tsx`
- `src/screens/Profile/SettingsScreen.tsx`

**UI Components:**

- `src/components/ui/OfflineBanner.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/LoadingSpinner.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/ErrorState.tsx`

**Root:**

- `App.tsx` — full bootstrap wiring
- `index.ts` — entry point

### Bugs Found & Fixed

| #   | File                    | Bug                                                                 | Fix                                                       |
| --- | ----------------------- | ------------------------------------------------------------------- | --------------------------------------------------------- |
| 1   | `babel.config.js`       | `"nativewind/babel"` included (v2 preset in v4 project)             | Removed — v4 uses `jsxImportSource` only                  |
| 2   | `babel.config.js`       | `root: ["./"]` too broad                                            | Changed to `root: ["./src"]`                              |
| 3   | `App.tsx`               | `useUIStore` called outside provider tree                           | Extracted to `NetworkListener` component inside tree      |
| 4   | `App.tsx`               | Duplicate NetInfo listeners                                         | Consolidated — one for TanStack Query, one for uiStore    |
| 5   | `App.tsx`               | `refetchOnWindowFocus` missing from QueryClient                     | Added — mobile apps have no window focus                  |
| 6   | `App.tsx`               | `colors.primary` not used in `LoadingFallback`                      | Replaced hardcoded `#4CAF50` with `colors.primary`        |
| 7   | `navigation/types.ts`   | `CompositeScreenProps` broken — React Navigation v7 breaking change | Removed composite helpers — param lists only (D-011)      |
| 8   | `navigation/types.ts`   | `LiveScoring.matchId` optional                                      | Made required — match always created before navigating    |
| 9   | `navigation/types.ts`   | `ShareCard` had `format` param                                      | Removed — format is local UI state inside ShareCardScreen |
| 10  | `navigation/types.ts`   | `AnalyticsTab` missing from `MainTabParamList`                      | Added with `AnalyticsStackParamList`                      |
| 11  | `uiStore.ts`            | `Math.random()` for toast ID                                        | Replaced with `Crypto.randomUUID()`                       |
| 12  | `uiStore.ts`            | `liveSyncEnabled` in store                                          | Removed — it's a config flag, not reactive state          |
| 13  | `activeMatchStore.ts`   | Too many granular setters causing multiple re-renders               | Replaced with single `applyEvent(snapshot)` atomic update |
| 14  | `activeMatchStore.ts`   | `setMatch` didn't reset serving state                               | Fixed — full state reset including serve fields           |
| 15  | `matchDb.ts`            | `any` used for row type                                             | Replaced with explicit `MatchRow` type                    |
| 16  | `matchDb.ts`            | Row mapping duplicated 3 times                                      | Extracted to `mapRowToMatch` pure function                |
| 17  | `matchDb.ts`            | `sync_status` missing from `insertMatch`                            | Added explicitly                                          |
| 18  | `matchDb.ts`            | Filename `match.db.ts` — Metro can't resolve dots in filenames      | Renamed to `matchDb.ts`                                   |
| 19  | `base.types.ts`         | `SyncStatus` missing `"deleted"`                                    | Added — required for soft delete                          |
| 20  | `base.types.ts`         | `id: number` missing from `BaseEntity`                              | Added — SQLite autoincrement PK                           |
| 21  | `match.types.ts`        | `servingTeamId/PlayerId` non-nullable                               | Made `string \| null` — null during setup                 |
| 22  | `match.mock.ts`         | `id` field missing                                                  | Added `id: 0` to all mock objects                         |
| 23  | `user.mock.ts`          | `id` field missing                                                  | Added `id: 0`                                             |
| 24  | `LiveScoringScreen.tsx` | Unescaped apostrophe in JSX                                         | Replaced with `&apos;`                                    |
| 25  | `ShareCardScreen.tsx`   | `format` in route params                                            | Removed — converted to `useState` local state             |
| 26  | Various screens         | Imported removed composite prop types                               | Switched to inline `useNavigation` hook pattern           |

### Decisions Added This Session

| ID    | Decision                                                                            |
| ----- | ----------------------------------------------------------------------------------- |
| D-011 | React Navigation v7 — drop composite screen props, use hook-based typing per screen |

### Verification Results

| Check               | Result        |
| ------------------- | ------------- |
| `npx tsc --noEmit`  | ✅ 0 errors   |
| `npx expo lint`     | ✅ 0 problems |
| App boots on device | ✅ Confirmed  |
| All tabs navigate   | ✅ Confirmed  |
| Offline banner      | ✅ Confirmed  |

### Commit

```
feat: scaffold DULA Phase 1 foundation (Stages 1–11)

- Init Expo project with TypeScript strict mode and @/ path aliases
- Configure NativeWind v4, Reanimated, and babel-plugin-module-resolver
- Install all Phase 1 dependencies (navigation, SQLite, share, haptics, fonts)
- Bootstrap App.tsx with SQLiteProvider, QueryClientProvider, font loading,
  NetworkListener, and OfflineBanner
- Define all navigation param lists (React Navigation v7, no composite types)
- Scaffold all stacks (Home, Match, History, Profile) and MainTabs
- Wire RootNavigator with no auth gate (Phase 1 — local only)
- Implement uiStore (isOffline, toasts) and activeMatchStore (applyEvent pattern)
- Define BaseEntity, SyncStatus, Match, MatchEvent, Team, UserProfile, Tournament types
- Implement matchDb service with WAL mode, all indexes, and typed MatchRow mapper
- Add mock data and mock hooks for matches and user profile
- Add theme constants, scoring constants, logger, formatDate, shareCard utils
- Scaffold all placeholder screens (Dashboard, MatchSetup, LiveScoring,
  MatchSummary, ShareCard, MatchHistory, MatchDetail, Profile, Settings)
- Fix: React Navigation v7 type pattern (D-011), matchDb filename (no dots),
  nullable servingTeamId/servingPlayerId, SyncStatus missing deleted variant

BREAKING: No Firebase/Firestore in Phase 1 — fully offline SQLite only
```

---

## Session 003 — Scoring Engine (Stage 12)

**Date:** May 11, 2026
**Goal:** Implement the core scoring engine with pure functions and full Jest coverage for pickleball rules.

### Stages Completed

| Stage | Description                                    | Status  |
| ----- | ---------------------------------------------- | ------- |
| 12    | Scoring Engine (Pure Logic) + Jest unit tests | ✅ Done |

### Files Created / Modified

**Types:**

- `src/types/match.types.ts` — Added `serverNumber: 1 | 2` to `Match` entity.

**Stores:**

- `src/store/activeMatchStore.ts` — Added `serverNumber` to `MatchSnapshot`, `ActiveMatchState`, and `INITIAL_STATE`.

**Features:**

- `src/features/scoring/scoringEngine.ts` — Pure functions for pickleball logic (`getInitialMatchState`, `calculateSnapshot`, `addPoint`, `addFault`, `callTimeout`, `undo`, `checkWinCondition`). Implements standard scoring and rally scoring, singles/doubles serve rotation, and win-by-two logic.
- `src/features/scoring/scoringEngine.test.ts` — Full Jest suite covering all core scenarios.

### Bugs Found & Fixed

| #   | File               | Bug                                                                 | Fix                                                       |
| --- | ------------------ | ------------------------------------------------------------------- | --------------------------------------------------------- |
| 1   | `scoringEngine.ts` | `getInitialMatchState` used `match.score` causing re-calc to double points | Initialized scores and timeouts to 0 in `getInitialMatchState`. |
| 2   | `scoringEngine.test.ts` | Tests failing due to `calculateSnapshot` resetting state to initial | Rewrote tests to use a sequence of events to reach target state. |

### Verification Results

| Check                                        | Result      |
| -------------------------------------------- | ----------- |
| `npx tsc --noEmit`                           | ✅ 0 errors |
| `node node_modules\jest\bin\jest.js`         | ✅ 10/10 passed |

### Commit

```
feat: implement scoring engine with full jest coverage (Stage 12)

- Implement src/features/scoring/scoringEngine.ts with pure functions
- Add support for singles and doubles serve rotation (Pickleball rules)
- Implement 'First Server' rule for start of game (Server 2)
- Add undo support via deterministic event-log re-calculation
- Add win condition check with win-by-two support
- Add timeout tracking logic
- Update Match and MatchSnapshot types to include serverNumber (1 | 2)
- Add comprehensive test suite in src/features/scoring/scoringEngine.test.ts
- Fix: getInitialMatchState now correctly starts at 0-0 for re-calculation consistency
```

---

## Next Session — Stage 13: UI Primitives

**Start here:**

Build atomic UI components in `src/components/ui/` using NativeWind v4:

- `Button.tsx` (Primary, Secondary, Ghost)
- `Card.tsx`
- `LoadingSpinner.tsx`
- `EmptyState.tsx`
- `ErrorState.tsx`

---

_SUMMARY.md — append only. Never delete previous sessions._
