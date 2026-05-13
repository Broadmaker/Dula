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

## Session 003 — Scoring Engine + UI Primitives + Feature Screens (Stages 12–14)

**Date:** May 2026
**Goal:** Build scoring engine with full Jest coverage, all UI primitives, and key feature screens (LiveScoring, ShareCard, Dashboard).

### Stages Completed

| Stage        | Description                                                           | Status  |
| ------------ | --------------------------------------------------------------------- | ------- |
| 12           | Scoring engine — pure functions + 16 Jest tests                       | ✅ Done |
| 13           | UI primitives — Button, Card, LoadingSpinner, EmptyState, ErrorState  | ✅ Done |
| 14 (partial) | Feature screens — LiveScoringScreen, ShareCardScreen, DashboardScreen | ✅ Done |

### Files Created / Modified

**Scoring Engine:**

- `src/features/scoring/scoringEngine.ts` — 7 pure functions, no side effects
- `src/features/scoring/scoringEngine.test.ts` — 16 tests, all passing
- `src/__mocks__/expo-crypto.ts` — Jest mock for native module

**UI Primitives:**

- `src/components/ui/Button.tsx` — 4 variants, 3 sizes, loading state, icon slot, accessibility
- `src/components/ui/Card.tsx` — dark mode aware surface container
- `src/components/ui/LoadingSpinner.tsx` — fullScreen variant, optional message
- `src/components/ui/EmptyState.tsx` — title, message, icon, optional CTA
- `src/components/ui/ErrorState.tsx` — title, message, optional retry

**Feature Screens:**

- `src/screens/Match/LiveScoringScreen.tsx` — full scoring flow wired to engine + SQLite
- `src/screens/Match/ShareCardScreen.tsx` — format toggle, capture, share, save
- `src/screens/Home/DashboardScreen.tsx` — recent matches list, quick-start CTA

**Services:**

- `src/services/share/shareCard.service.ts` — captureCard, shareImage, saveToGallery

**Store Updates:**

- `src/store/activeMatchStore.ts` — added `isFirstServer: boolean`, `serverNumber: number`

**Config:**

- `package.json` — added Jest config (preset, transformIgnorePatterns, moduleNameMapper)

### Bugs Found & Fixed

| #   | File                    | Bug                                                                | Fix                                                             |
| --- | ----------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------- |
| 1   | `scoringEngine.ts`      | `Math.random()` for eventId                                        | Replaced with `Crypto.randomUUID()`                             |
| 2   | `scoringEngine.ts`      | `calculateSnapshot` called on every action — O(n) replay           | Snapshot passed directly as first arg — calculate only for undo |
| 3   | `scoringEngine.ts`      | `undo` both stored UNDO event AND truncated — double counting      | Truncate only — no UNDO event stored                            |
| 4   | `scoringEngine.ts`      | First-game one-fault rule incomplete                               | Added `isFirstServer` flag to `MatchSnapshot`                   |
| 5   | `scoringEngine.ts`      | Receiving team win in standard scoring called `applyFault`         | Corrected to call `sideOut` directly                            |
| 6   | `scoringEngine.ts`      | Unused `currentPlayerIdx` variable                                 | Removed                                                         |
| 7   | `scoringEngine.test.ts` | `addPoint/addFault` called with old signature                      | Updated to new snapshot-first signature                         |
| 8   | `scoringEngine.test.ts` | `match` mutated directly in multi-step tests                       | Switched to immutable snapshot threading                        |
| 9   | `scoringEngine.test.ts` | `checkWinCondition` args reversed                                  | Fixed — snapshot first, match second                            |
| 10  | `scoringEngine.test.ts` | Snapshot missing `isFirstServer`                                   | Added to all inline snapshot objects                            |
| 11  | `scoringEngine.test.ts` | `undo` called twice                                                | Removed duplicate call                                          |
| 12  | `scoringEngine.test.ts` | Missing `callTimeout` tests                                        | Added — deducts timeout, respects max                           |
| 13  | `match.types.ts`        | `serverNumber` added incorrectly — belongs in `MatchSnapshot` only | Removed from `Match` type                                       |
| 14  | `activeMatchStore.ts`   | `serverNumber: 1 \| 2` too narrow                                  | Changed to `number`                                             |
| 15  | `activeMatchStore.ts`   | `isFirstServer` missing                                            | Added to `MatchSnapshot` and store state                        |
| 16  | `package.json`          | No Jest config — native modules failing                            | Added preset, transformIgnorePatterns, moduleNameMapper         |
| 17  | `expo-crypto mock`      | Placed in `src/mocks/` instead of `src/__mocks__/`                 | Moved to correct `__mocks__` folder                             |
| 18  | `Button.tsx`            | `label: string` instead of `children`                              | Switched to `children: React.ReactNode`                         |
| 19  | `Button.tsx`            | Hardcoded color in ActivityIndicator                               | Replaced with `colors.primary` / `colors.onPrimary`             |
| 20  | `Button.tsx`            | `accessibilityLabel` missing                                       | Added with role and state                                       |
| 21  | `LoadingSpinner.tsx`    | `message` prop missing                                             | Added with `Text` below spinner                                 |
| 22  | `LoadingSpinner.tsx`    | `bg-background-dark` invalid Tailwind class                        | Replaced with `bg-[#121212]`                                    |
| 23  | `LiveScoringScreen.tsx` | `useActiveMatchStore()` whole-store subscription                   | Replaced with selective selectors per value/action              |
| 24  | `LiveScoringScreen.tsx` | `useEffect` missing `activeMatch` deps                             | Fixed — stable selectors used as deps                           |
| 25  | `LiveScoringScreen.tsx` | `serverNumber` on `updatedMatch` — field removed from `Match`      | Removed from all `updatedMatch` objects                         |
| 26  | `LiveScoringScreen.tsx` | Snapshot built inline 3 times                                      | Extracted to `getCurrentSnapshot` useCallback                   |
| 27  | `LiveScoringScreen.tsx` | `bg-background-dark` invalid class                                 | Replaced with `bg-[#121212]`                                    |
| 28  | `LiveScoringScreen.tsx` | `handlePoint` depended on `handleEndMatch` not in deps             | Moved `handleEndMatch` above `handlePoint`, added to deps       |
| 29  | `LiveScoringScreen.tsx` | `handlePoint` declared twice after reorder                         | Removed duplicate block                                         |
| 30  | `LiveScoringScreen.tsx` | `NodeJS.Timeout` unavailable in RN                                 | Changed to `ReturnType<typeof setInterval>`                     |
| 31  | `ShareCardScreen.tsx`   | `Card` imported but unused                                         | Removed import                                                  |
| 32  | `ShareCardScreen.tsx`   | `bg-background-dark` invalid class                                 | Replaced with `bg-[#121212]`                                    |
| 33  | `ShareCardScreen.tsx`   | `captureCard` received `ref.current` instead of `ref`              | Fixed to pass `RefObject` directly                              |
| 34  | `shareCard.service.ts`  | `any` type on `viewRef`                                            | Typed as `RefObject<View \| null>`                              |
| 35  | `shareCard.service.ts`  | `Platform` imported but unused                                     | Removed                                                         |
| 36  | `DashboardScreen.tsx`   | `ScrollView`, `RefreshControl` unused                              | Removed imports                                                 |
| 37  | `DashboardScreen.tsx`   | `MatchStackParamList`, `HistoryStackParamList` unused              | Removed imports                                                 |
| 38  | `DashboardScreen.tsx`   | `isEmpty` unused                                                   | Removed from destructure                                        |
| 39  | `DashboardScreen.tsx`   | `bg-background-dark` invalid class                                 | Replaced with `bg-[#121212]`                                    |

### Verification Results

| Check                | Result           |
| -------------------- | ---------------- |
| `npx tsc --noEmit`   | ✅ 0 errors      |
| `npx expo lint`      | ✅ 0 warnings    |
| `npx jest --verbose` | ✅ 16/16 passing |

### Commits

```
feat: implement scoring engine with full Jest coverage (Stage 12)

- Add scoringEngine.ts — pure functions, no side effects
- Implement getInitialMatchState, addPoint, addFault, callTimeout,
  undo, checkWinCondition, calculateSnapshot
- Handle doubles serve rotation — first-game one-fault rule,
  server 1/2 switching, side-out logic
- Handle singles serve rotation and side-out
- Handle rally scoring vs standard scoring
- Handle win-by-two condition
- Add isFirstServer flag to MatchSnapshot for first-game rule
- Add expo-crypto Jest mock in src/__mocks__/
- Add Jest config to package.json — preset, transformIgnorePatterns,
  moduleNameMapper for @/ alias and expo-crypto mock
- Fix: remove serverNumber from Match type — belongs in MatchSnapshot only
- 16 tests passing across 6 describe blocks
```

```
feat: UI primitives, scoring screen, and share card (Stages 13-14)

- Add Button — primary/secondary/ghost/error variants, size sm/md/lg,
  loading state, icon slot, accessibility props
- Add Card — dark mode aware surface container
- Add LoadingSpinner — fullScreen variant, optional message
- Add EmptyState — title, message, icon, optional CTA
- Add ErrorState — title, message, optional retry callback
- Fix LiveScoringScreen — Zustand selective selectors, useCallback on
  all handlers, handleEndMatch moved before handlePoint
- Fix LiveScoringScreen — ReturnType<typeof setInterval> for RN compat
- Fix ShareCardScreen — RefObject<View | null> type, remove unused imports
- Fix shareCard.service.ts — typed viewRef, remove Platform
- Fix DashboardScreen — remove unused imports and destructures
```

---

## Session 004 — Stage 14 Complete (Feature Components + Remaining Screens)

**Date:** May 2026
**Goal:** Build all remaining feature components and screens to complete Stage 14.

### Stages Completed

| Stage | Description                                    | Status  |
| ----- | ---------------------------------------------- | ------- |
| 14    | All feature components + all remaining screens | ✅ Done |

### Files Created / Modified

**Feature Components:**

- `src/components/features/matches/MatchCard.tsx` — animated pulse for active matches, winner highlight, score display
- `src/components/features/scoring/TeamCard.tsx` — large score display, serving indicator, server number badge
- `src/components/features/scoring/MatchTimer.tsx` — live/paused states, Reanimated pulse animation
- `src/components/features/scoring/ActionBar.tsx` — Undo, Timeout, End Match buttons with guards
- `src/components/features/share/ShareCardFeed.tsx` — 1:1 feed format share card
- `src/components/features/share/ShareCardStory.tsx` — 9:16 story format share card

**Screens:**

- `src/screens/Home/MatchSetupScreen.tsx` — full match creation form, SQLite insert, store sync, navigate to LiveScoring
- `src/screens/Match/MatchSummaryScreen.tsx` — winner display, stats grid, share + history CTAs
- `src/screens/History/MatchHistoryScreen.tsx` — FlatList with pull-to-refresh, focus reload
- `src/screens/History/MatchDetailScreen.tsx` — match breakdown, event timeline, reshare, resume, soft delete
- `src/screens/Profile/SettingsScreen.tsx` — haptics/sound toggles, clear history, version info
- `src/screens/Profile/ProfileScreen.tsx` — display name editor, stats from match history, Phase 2 placeholders

**New Store:**

- `src/store/settingsStore.ts` — `hapticsEnabled`, `soundEnabled`

**DB Updates:**

- `src/services/db/matchDb.ts` — added `deleteMatch` (soft delete via `sync_status = 'deleted'`)

**Constants:**

- `src/constants/scoring.ts` — added `LOCAL_USER_ID = "local-user"`

### Bugs Found & Fixed

| #   | File                     | Bug                                                                       | Fix                                              |
| --- | ------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------ |
| 1   | `MatchCard.tsx`          | Winner by score comparison — breaks edge cases                            | Use `checkWinCondition` + `calculateSnapshot`    |
| 2   | `MatchCard.tsx`          | Encoding error `ΓÇó` in footer                                            | Fixed to `·`                                     |
| 3   | `MatchCard.tsx`          | `accessibilityLabel` missing                                              | Added with team names and score                  |
| 4   | `TeamCard.tsx`           | `serverNumber?: 1 \| 2` too narrow — caused TS error in LiveScoringScreen | Widened to `number`                              |
| 5   | `ActionBar.tsx`          | `SafeAreaView` from `react-native` — no `edges` prop                      | Changed to `react-native-safe-area-context`      |
| 6   | `ShareCardFeed.tsx`      | `StyleSheet.create` — forbidden anti-pattern                              | Replaced with `className="w-full aspect-square"` |
| 7   | `ShareCardFeed.tsx`      | Encoding error `ΓÇó`                                                      | Fixed to `·`                                     |
| 8   | `ShareCardFeed.tsx`      | Props `match + teamA + teamB` didn't match ShareCardScreen usage          | Changed to `data: ShareCardData`                 |
| 9   | `MatchSetupScreen.tsx`   | `serverNumber` on `Match` object — field removed from type                | Removed                                          |
| 10  | `MatchSetupScreen.tsx`   | Hardcoded Switch colors                                                   | Used `colors.primary`                            |
| 11  | `MatchSetupScreen.tsx`   | `ownerId: "local-user"` hardcoded string                                  | Extracted to `LOCAL_USER_ID` constant            |
| 12  | `MatchSummaryScreen.tsx` | Winner by score comparison                                                | Use `checkWinCondition` + `calculateSnapshot`    |
| 13  | `MatchSummaryScreen.tsx` | `space-y-4` not supported in NativeWind v4                                | Removed — children have explicit margins         |
| 14  | `MatchHistoryScreen.tsx` | Double load on mount — focus listener + explicit call                     | Removed explicit call — focus handles all loads  |
| 15  | `MatchHistoryScreen.tsx` | Empty state navigated to wrong route                                      | Fixed `HomeTab → Dashboard`                      |
| 16  | `MatchDetailScreen.tsx`  | Hard delete — GLOBAL.md §21 violation                                     | Soft delete via `sync_status = 'deleted'`        |
| 17  | `MatchDetailScreen.tsx`  | `Button` children had nested `Text`                                       | Removed nested `Text` — Button renders its own   |
| 18  | `MatchDetailScreen.tsx`  | `colors` imported but unused                                              | Removed import                                   |
| 19  | `SettingsScreen.tsx`     | `useSettingsStore` didn't exist                                           | Created `settingsStore.ts`                       |
| 20  | `ProfileScreen.tsx`      | Double load on mount                                                      | Removed explicit call — focus handles all loads  |
| 21  | `ProfileScreen.tsx`      | `Button` children had nested `Text`                                       | Removed nested `Text`                            |
| 22  | `ProfileScreen.tsx`      | `ProfileStatBox` defined but never used                                   | Removed                                          |
| 23  | `scoringEngine.test.ts`  | `serverNumber` in `createBaseMatch` — removed from `Match` type           | Removed from test helper                         |

### Verification Results

| Check                | Result           |
| -------------------- | ---------------- |
| `npx tsc --noEmit`   | ✅ 0 errors      |
| `npx expo lint`      | ✅ 0 warnings    |
| `npx jest --verbose` | ✅ 16/16 passing |

### Commit

```
feat: complete Stage 14 — feature components and all screens

Feature components:
- Add MatchCard — Reanimated pulse for active matches, winner highlight,
  checkWinCondition for accurate winner detection
- Add TeamCard — large scoreboard display, serving indicator, server badge
- Add MatchTimer — live/paused animation, formatDuration display
- Add ActionBar — Undo/Timeout/EndMatch with disabled guards,
  SafeAreaView from react-native-safe-area-context
- Add ShareCardFeed — 1:1 format, NativeWind only (no StyleSheet),
  ShareCardData props
- Add ShareCardStory — 9:16 format, winner badge, DULA branding

Screens:
- Add MatchSetupScreen — full form, SQLite insert, store sync, navigate
- Add MatchSummaryScreen — winner display, stats grid, share + history CTAs
- Add MatchHistoryScreen — FlatList, pull-to-refresh, focus reload
- Add MatchDetailScreen — event timeline, reshare, resume, soft delete
- Add SettingsScreen — haptics/sound toggles, clear history
- Add ProfileScreen — display name editor, live stats from SQLite

New:
- Add settingsStore — hapticsEnabled, soundEnabled
- Add matchDb.deleteMatch — soft delete via sync_status = deleted
- Add LOCAL_USER_ID constant

Fix: serverNumber removed from Match (MatchSnapshot only), winner
detection uses checkWinCondition throughout, no hard deletes,
no nested Text inside Button, focus-only load pattern
```

---

## Next Session — Stage 15: Real Hook Cutover

**Start here:**

Build `src/hooks/useMatch.ts` — TanStack Query, reads from `matchDb`.

```ts
// Pattern to follow (GLOBAL.md §9)
export const matchKeys = {
  all: () => ["matches"] as const,
  list: () => ["matches", "list"] as const,
  detail: (id: string) => ["matches", "detail", id] as const,
};

export function useMatchList() {
  return useQuery({
    queryKey: matchKeys.list(),
    queryFn: async () => { ... } // reads from matchDb
  });
}

export function useMatchDetail(uuid: string) {
  return useQuery({
    queryKey: matchKeys.detail(uuid),
    queryFn: async () => { ... }
  });
}
```

Then swap in screens:

- `DashboardScreen` — `useMatchMock` → `useMatch`
- `MatchHistoryScreen` — direct SQLite calls → `useMatch`

---

_SUMMARY.md — append only. Never delete previous sessions._
