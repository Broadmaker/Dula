# tasks/todo.md — DULA Phase 1 Bootstrap

**Goal:** Scaffold the full project, wire navigation, set up SQLite, and have a running app on device/simulator with mock data before writing any real feature logic.

**Rule:** Check off each step only after it is verified working. No skipping.

---

## Stage 1 — Project Init

- [ ] 1.1 Create Expo project: `npx create-expo-app dula --template blank-typescript`
- [ ] 1.2 Configure `tsconfig.json` — strict mode + `@/` path alias
- [ ] 1.3 Configure `babel.config.js` — `babel-plugin-module-resolver`
- [ ] 1.4 Verify alias works: import a test file using `@/` — no errors
- [ ] 1.5 Copy `project.config.ts` into project root
- [ ] 1.6 Set up EAS: `eas init` + configure `eas.json` (dev / preview / production profiles)
- [ ] 1.7 Set up `.env` file with Firebase placeholders (empty values for now)
- [ ] 1.8 Set up `.gitignore` — exclude `.env`, `node_modules`, `.expo`
- [ ] 1.9 First commit: `feat: init expo project with typescript and path aliases`

---

## Stage 2 — Install Dependencies

- [ ] 2.1 Navigation:
  ```bash
  npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
  ```
- [ ] 2.2 Styling:
  ```bash
  npx expo install nativewind tailwindcss
  npx tailwindcss init
  ```
- [ ] 2.3 State:
  ```bash
  npx expo install zustand @tanstack/react-query
  ```
- [ ] 2.4 Local DB:
  ```bash
  npx expo install expo-sqlite
  ```
- [ ] 2.5 Share card:
  ```bash
  npx expo install react-native-view-shot expo-sharing expo-media-library
  ```
- [ ] 2.6 Haptics + Audio:
  ```bash
  npx expo install expo-haptics expo-av
  ```
- [ ] 2.7 Animations:
  ```bash
  npx expo install react-native-reanimated lottie-react-native
  ```
- [ ] 2.8 Fonts:
  ```bash
  npx expo install @expo-google-fonts/poppins @expo-google-fonts/inter @expo-google-fonts/montserrat expo-font
  ```
- [ ] 2.9 Utilities:
  ```bash
  npx expo install expo-crypto expo-secure-store @react-native-community/netinfo
  ```
- [ ] 2.10 Dev tools:
  ```bash
  npm install -D babel-plugin-module-resolver
  ```
- [ ] 2.11 Run `npx expo start` — confirm app boots with no errors
- [ ] 2.12 Commit: `feat: install all Phase 1 dependencies`

---

## Stage 3 — Folder Structure

- [ ] 3.1 Scaffold all folders per PROJECT.md §6:
  ```
  src/navigation/stacks/
  src/navigation/tabs/
  src/screens/Home/
  src/screens/Match/
  src/screens/History/
  src/screens/Profile/
  src/components/ui/
  src/components/features/scoring/
  src/components/features/share/
  src/components/features/matches/
  src/features/scoring/
  src/services/db/
  src/services/share/
  src/store/
  src/hooks/
  src/mocks/
  src/types/
  src/utils/
  src/constants/
  tasks/
  ```
- [ ] 3.2 Add a `.gitkeep` in each empty folder so git tracks them
- [ ] 3.3 Commit: `feat: scaffold folder structure`

---

## Stage 4 — Constants & Theme

- [ ] 4.1 `src/constants/theme.ts` — color tokens + font names from PROJECT.md §10
- [ ] 4.2 `src/constants/scoring.ts` — `SCORE_LIMITS`, `MAX_TIMEOUTS_PER_TEAM`, `SIDE_SWITCH_THRESHOLD`
- [ ] 4.3 `src/constants/firebase.ts` — collection name constants (empty strings for now, used in Phase 2)
- [ ] 4.4 Configure `tailwind.config.js` — extend with DULA color tokens
- [ ] 4.5 Commit: `feat: add theme constants and tailwind config`

---

## Stage 5 — Types

- [ ] 5.1 `src/types/base.types.ts` — `BaseEntity`, `SyncStatus` (GLOBAL.md §10)
- [ ] 5.2 `src/types/event.types.ts` — `MatchEvent` union type
- [ ] 5.3 `src/types/match.types.ts` — `Match`, `Team`, `MatchType`, `MatchStatus`, `ScoreLimit`
- [ ] 5.4 `src/types/user.types.ts` — `UserProfile`
- [ ] 5.5 `src/types/tournament.types.ts` — `Tournament`, `Standing`, `Court` (scaffold only — Phase 4)
- [ ] 5.6 Run `npx tsc --noEmit` — zero errors
- [ ] 5.7 Commit: `feat: define all core TypeScript types`

---

## Stage 6 — Utilities & Logger

- [ ] 6.1 `src/utils/logger.ts` — central logger (GLOBAL.md §14 pattern)
- [ ] 6.2 `src/utils/formatDate.ts` — ISO 8601 helpers (`formatMatchDate`, `formatDuration`)
- [ ] 6.3 `src/utils/shareCard.ts` — pure function: `buildShareCardData(match: Match): ShareCardData`
- [ ] 6.4 Commit: `feat: add logger, formatDate, and shareCard utils`

---

## Stage 7 — Zustand Stores

- [ ] 7.1 `src/store/uiStore.ts` — `isOffline`, `toasts`, `liveSyncEnabled` (off)
- [ ] 7.2 `src/store/activeMatchStore.ts` — full store per PROJECT.md §7
- [ ] 7.3 Verify stores export correctly — no TypeScript errors
- [ ] 7.4 Commit: `feat: add uiStore and activeMatchStore`

---

## Stage 8 — SQLite Database

- [ ] 8.1 `src/services/db/match.db.ts`:
  - `CREATE TABLE IF NOT EXISTS matches` per SCHEMA.md
  - WAL mode: `PRAGMA journal_mode=WAL`
  - All indexes created on init
  - Functions: `insertMatch`, `updateMatch`, `getMatchByUuid`, `getAllMatches`, `getRecentMatches`
- [ ] 8.2 Wire `SQLiteProvider` in `App.tsx` — DB initializes on first run
- [ ] 8.3 Test: insert a mock match, read it back — verify round-trip
- [ ] 8.4 Commit: `feat: sqlite schema and match.db service`

---

## Stage 9 — Mock Data & Mock Hooks

- [ ] 9.1 `src/mocks/match.mock.ts` — 3–5 realistic completed matches + 1 active match
- [ ] 9.2 `src/mocks/user.mock.ts` — 1 local user profile
- [ ] 9.3 `src/hooks/useMatchMock.ts` — returns `{ data, isLoading, isError, isEmpty }` with simulated 800ms delay
- [ ] 9.4 `src/hooks/useProfileMock.ts` — same shape
- [ ] 9.5 Verify mock hook shape matches what real hook will return
- [ ] 9.6 Commit: `feat: mock data and mock hooks`

---

## Stage 10 — Navigation Scaffold

- [ ] 10.1 `src/navigation/types.ts` — ALL param lists (per PROJECT.md §5)
- [ ] 10.2 Placeholder screens — one `<Text>` component per screen, just enough to navigate:
  - `DashboardScreen`, `MatchSetupScreen`
  - `LiveScoringScreen`, `MatchSummaryScreen`, `ShareCardScreen`
  - `MatchHistoryScreen`, `MatchDetailScreen`
  - `ProfileScreen`, `SettingsScreen`
- [ ] 10.3 `src/navigation/stacks/HomeStack.tsx`
- [ ] 10.4 `src/navigation/stacks/MatchStack.tsx`
- [ ] 10.5 `src/navigation/stacks/HistoryStack.tsx`
- [ ] 10.6 `src/navigation/stacks/ProfileStack.tsx`
- [ ] 10.7 `src/navigation/tabs/MainTabs.tsx` — bottom tab bar with all 4 tabs (Analytics tab hidden until Phase 3)
- [ ] 10.8 `src/navigation/RootNavigator.tsx` — mounts `MainTabs` directly (no auth gate in Phase 1)
- [ ] 10.9 Wire `RootNavigator` in `App.tsx`
- [ ] 10.10 Manually tap through every screen — no crash, correct tab/stack behaviour
- [ ] 10.11 Run `npx tsc --noEmit` — zero errors on param lists
- [ ] 10.12 Commit: `feat: full navigation scaffold with placeholder screens`

---

## Stage 11 — App.tsx Bootstrap

- [ ] 11.1 `App.tsx` wires everything together:
  - `SQLiteProvider`
  - `QueryClientProvider` (TanStack Query with GLOBAL.md §9 defaults)
  - `onlineManager` + `NetInfo` wired (GLOBAL.md §9)
  - Font loading via `useFonts` (Poppins, Inter, Montserrat)
  - `RootNavigator`
  - `OfflineBanner` component overlaid globally
- [ ] 11.2 `src/components/ui/OfflineBanner.tsx` — reads `uiStore.isOffline`, shows persistent bar
- [ ] 11.3 NetInfo listener in `App.tsx` sets `uiStore.setOffline()`
- [ ] 11.4 Test: toggle wifi off on simulator — banner appears. Toggle on — banner disappears.
- [ ] 11.5 Commit: `feat: App.tsx bootstrap with SQLite, TanStack Query, fonts, offline banner`

---

## ✅ Verification Before Stage 12

Before moving to real feature screens, confirm ALL of the following:

- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npx expo lint` — zero warnings
- [ ] App boots cold in < 3 seconds on simulator
- [ ] All tabs navigate correctly
- [ ] All stacks push/pop correctly
- [ ] Offline banner appears/disappears on network toggle
- [ ] SQLite round-trip works (insert → read → verify)
- [ ] Fonts render (check Dashboard placeholder screen)
- [ ] No `console.log` — only `logger`
- [ ] No `app/` directory exists

**If all pass → proceed to Stage 12. If any fail → fix before moving on.**

---

## Stage 12 — Scoring Engine (Pure Logic)

- [ ] 12.1 `src/features/scoring/scoringEngine.ts`:
  - `addPoint(state, teamId)` → new state
  - `addFault(state, playerId)` → new state + serve rotation
  - `callTimeout(state, teamId)` → new state
  - `undo(state)` → previous state (pop last event)
  - `applySideSwitch(state)` → new state
  - `checkWinCondition(state)` → `{ winner: Team | null }`
  - `getInitialMatchState(config: MatchConfig)` → initial state
- [ ] 12.2 Jest unit tests — `scoringEngine.test.ts`:
  - Singles serve rotation
  - Doubles serve rotation (both players serve before side-out)
  - First game one-fault rule
  - Undo restores previous state
  - Win condition detected at score limit
  - Win-by-two holds until 2-point gap
- [ ] 12.3 `npx jest` — all tests pass
- [ ] 12.4 Commit: `feat: scoring engine with full jest coverage`

---

## Stage 13 — UI Primitives

- [ ] 13.1 `src/components/ui/Button.tsx` — primary / secondary / ghost variants, NativeWind
- [ ] 13.2 `src/components/ui/Card.tsx` — surface container, dark mode aware
- [ ] 13.3 `src/components/ui/LoadingSpinner.tsx`
- [ ] 13.4 `src/components/ui/EmptyState.tsx` — message + optional CTA button
- [ ] 13.5 `src/components/ui/ErrorState.tsx` — message + retry callback
- [ ] 13.6 Commit: `feat: ui primitive components`

---

## Stage 14 — Feature Screens (Phase 1 Core)

> Build in this order. Each screen connects to mock hook first.

### 14A — Dashboard

- [x] `DashboardScreen` — recent matches list (mock), quick-start "New Match" button
- [x] `src/components/features/matches/MatchCard.tsx` — list item component

### 14B — Match Setup

- [x] `MatchSetupScreen` — form: type, score limit, win-by-2, rally toggle, team names
- [x] On submit: `insertMatch()` to SQLite → navigate to `LiveScoringScreen`

### 14C — Live Scoring

- [x] `LiveScoringScreen` — full scoreboard UI wired to `activeMatchStore`
- [x] `src/components/features/scoring/TeamCard.tsx`
- [x] `src/components/features/scoring/MatchTimer.tsx`
- [x] `src/components/features/scoring/ActionBar.tsx`
- [x] Scoring calls `scoringEngine` → updates `activeMatchStore` → writes event to SQLite

### 14D — Match Summary + Share CTA

- [x] `MatchSummaryScreen` — final score, match stats, winner banner, Share CTA

### 14E — Share Card

- [x] `src/components/features/share/ShareCardFeed.tsx`
- [x] `src/components/features/share/ShareCardStory.tsx`
- [x] `ShareCardScreen` — preview, format toggle, Share + Save buttons
- [x] `src/services/share/shareCard.service.ts`

### 14F — History

- [x] `MatchHistoryScreen` — FlatList, pull-to-refresh, focus reload
- [x] `MatchDetailScreen` — match breakdown, event timeline, reshare, soft delete

### 14G — Settings + Profile

- [x] `SettingsScreen` — haptics/sound toggles, clear history, version
- [x] `ProfileScreen` — display name editor, stats from SQLite

---

## Stage 15 — Real Hook Cutover

- [ ] 15.1 Create `src/hooks/useMatch.ts` — TanStack Query with `matchKeys` factory
- [ ] 15.2 Implement `useMatchList()` — reads all matches from `matchDb`
- [ ] 15.3 Implement `useMatchDetail(uuid)` — reads single match from `matchDb`
- [ ] 15.4 Swap `useMatchMock` → `useMatchList` in `DashboardScreen`
- [ ] 15.5 Update `MatchHistoryScreen` to use `useMatchList` instead of direct SQLite
- [ ] 15.6 Verify screen behaviour identical to mock version
- [ ] 15.7 Run `npx tsc --noEmit && npx expo lint && npx jest`
- [ ] 15.8 Commit: `feat: real useMatch hook wired to SQLite (Stage 15)`

---

## Stage 15 — Real Hook Cutover

- [ ] 15.1 `src/hooks/useMatch.ts` — TanStack Query, reads from `match.db.ts`
- [ ] 15.2 Swap `useMatchMock` → `useMatch` in `DashboardScreen` and `MatchHistoryScreen`
- [ ] 15.3 Verify screen behaviour identical to mock version
- [ ] 15.4 Commit: `feat: real useMatch hook wired to SQLite`

---

## Stage 16 — Final Phase 1 Verification

- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npx expo lint` — zero warnings
- [ ] `npx jest` — all tests pass
- [ ] Full manual QA checklist from PROJECT.md §15:
  - [ ] Singles serve rotation correct
  - [ ] Doubles serve rotation correct
  - [ ] Undo/redo works
  - [ ] Match saves and survives app restart
  - [ ] Share card generates < 2 seconds
  - [ ] Feed card (1:1) no clipping
  - [ ] Story card (9:16) no clipping
  - [ ] Save to camera roll works
  - [ ] Native share sheet opens with image attached
  - [ ] Dark mode renders correctly
  - [ ] Offline banner shows/hides correctly
  - [ ] Live sync toggle shows "Coming soon"
- [ ] Commit: `feat: Phase 1 complete — offline scoring + share card`
- [ ] Tag: `git tag v0.1.0`

---

## Review

- What was built: _fill on completion_
- Decisions made: _fill on completion_
- Known tradeoffs: _fill on completion_
- Corrections received: _fill on completion_
