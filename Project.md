# PROJECT.md — DULA

> **Pickleball Scoring Platform**
> React Native · Expo · Firebase · Offline-First · Social Sharing
>
> ⚠️ Rules that exist in GLOBAL.md are NOT duplicated here. Reference GLOBAL.md by section name.

---

## Table of Contents

1. [App Identity](#1-app-identity)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Target Users](#3-target-users)
4. [Tech Stack — Overrides & Additions](#4-tech-stack--overrides--additions)
5. [Navigation Map](#5-navigation-map)
6. [Folder Structure](#6-folder-structure)
7. [State Management — DULA Specific](#7-state-management--dula-specific)
8. [Data Models](#8-data-models)
9. [Feature Breakdown](#9-feature-breakdown)
10. [UI/UX Design System](#10-uiux-design-system)
11. [Offline-First Strategy](#11-offline-first-strategy)
12. [Security & Data Integrity](#12-security--data-integrity)
13. [Performance Targets](#13-performance-targets)
14. [Notifications System](#14-notifications-system)
15. [Testing Strategy](#15-testing-strategy)
16. [Deployment Pipeline](#16-deployment-pipeline)
17. [Phase Roadmap](#17-phase-roadmap)
18. [Monetization Strategy](#18-monetization-strategy)
19. [Future Enhancements](#19-future-enhancements)

---

## 1. App Identity

| Item             | Detail                                           |
| ---------------- | ------------------------------------------------ |
| App Name         | DULA                                             |
| Tagline          | Score it. Save it. Share it.                     |
| Platform         | iOS + Android (React Native / Expo)              |
| Backend          | Firebase — Auth, Firestore, Storage, Functions   |
| Database         | Firestore (cloud) + expo-sqlite Next API (local) |
| Current Phase    | Planning                                         |
| Repo             | GitHub (link TBD)                                |
| Expo Account     | Ready                                            |
| Firebase Project | Ready                                            |

---

## 2. Goals & Success Metrics

### Primary Goals

- Simplify offline scorekeeping during live matches — no internet required
- Eliminate confusion around serve rotation
- Let players share a beautiful match result card to FB, IG Stories, or any social platform
- Provide reliable local match history
- Support clubs, leagues, and full tournament management (later phases)

> **Core loop (Phase 1):** Set up match → Score locally → See summary → Share image card to social

### Success Metrics (MVP)

| Metric                   | Target                       |
| ------------------------ | ---------------------------- |
| App launch time (cold)   | < 2 seconds                  |
| Score update (local)     | < 100ms                      |
| Frame rate               | 60 FPS                       |
| Offline match continuity | 100% — no data loss          |
| Share card generation    | < 2 seconds after match ends |
| Crash rate               | < 0.5%                       |

---

## 3. Target Users

| User Type             | Core Needs                                               |
| --------------------- | -------------------------------------------------------- |
| Casual Players        | Quick setup, easy scoring, shareable result card         |
| Competitive Players   | Stats tracking, win/loss history, social bragging rights |
| Coaches               | Match analysis, player performance review                |
| Tournament Organizers | Bracket management, court scheduling (Phase 4)           |

---

## 4. Tech Stack — Overrides & Additions

> Base stack is defined in GLOBAL.md §4. The items below are DULA-specific additions or confirmed choices.

| Layer         | Choice                                 | Notes                                               |
| ------------- | -------------------------------------- | --------------------------------------------------- |
| Backend       | Firebase (Firestore + Auth + Storage)  | Chosen over Supabase — see DECISIONS.md §D-001      |
| Local DB      | expo-sqlite Next API                   | Confirmed — see DECISIONS.md §D-002                 |
| Navigation    | React Navigation v6+ (NativeStack)     | Confirmed — NO Expo Router, ever                    |
| Styling       | NativeWind v4 only                     | Confirmed — see DECISIONS.md §D-003                 |
| Animations    | Reanimated 3 + Lottie                  | Score tap feedback, match end celebration           |
| Charts        | Victory Native                         | For analytics phase (Phase 3)                       |
| Audio/Haptics | Expo AV + Expo Haptics                 | Haptic on every score tap                           |
| Share Card    | react-native-view-shot                 | Captures share card component as image              |
| Social Share  | expo-sharing                           | Native share sheet — FB, IG Stories, WhatsApp, etc. |
| Image Save    | expo-media-library                     | Save share card to camera roll                      |
| Live Scoring  | Feature flag `enable_live_sync: false` | Disabled by default — see DECISIONS.md §D-009       |

### Environment Variables

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
```

---

## 5. Navigation Map

> Navigation implementation follows GLOBAL.md §7 exactly.
> All param lists live in `src/navigation/types.ts` — never inline.

```
RootNavigator
├── AuthStack         (when session = null — Phase 2+)
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── ForgotPasswordScreen
│
└── MainTabs          (Phase 1: no auth gate — local-only mode)
    ├── HomeTab → HomeStack
    │   ├── DashboardScreen        (recent matches, quick-start CTA)
    │   └── MatchSetupScreen       (configure new match)
    │
    ├── MatchTab → MatchStack
    │   ├── LiveScoringScreen      (active match scoreboard)
    │   ├── MatchSummaryScreen     (post-match result + share CTA)
    │   └── ShareCardScreen        (full-screen share card preview + export)
    │
    ├── HistoryTab → HistoryStack
    │   ├── MatchHistoryScreen     (list of past matches)
    │   └── MatchDetailScreen      (single match breakdown + reshare)
    │
    ├── AnalyticsTab → AnalyticsStack   (Phase 3+)
    │   └── AnalyticsDashboardScreen
    │
    └── ProfileTab → ProfileStack
        ├── ProfileScreen
        └── SettingsScreen         (includes Live Sync toggle — off by default)
```

> **Phase 1 note:** No auth stack in Phase 1 — app runs fully local. `RootNavigator` mounts `MainTabs` directly. Auth gate added in Phase 2.

### Navigation Param List Summary

```ts
// Defined in full in src/navigation/types.ts

AuthStackParamList:
  Login | Register | ForgotPassword

HomeStackParamList:
  Dashboard | MatchSetup

MatchStackParamList:
  LiveScoring: { matchId: string }
  MatchSummary: { matchId: string }
  ShareCard: { matchId: string; format: 'feed' | 'story' }

HistoryStackParamList:
  MatchHistory | MatchDetail: { matchId: string }

AnalyticsStackParamList:
  AnalyticsDashboard

ProfileStackParamList:
  Profile | Settings
```

---

## 6. Folder Structure

> Extends GLOBAL.md §5. Only DULA-specific additions listed here.

```
src/
├── navigation/
│   ├── RootNavigator.tsx
│   ├── types.ts                     ← ALL param lists — see §5
│   ├── stacks/
│   │   ├── AuthStack.tsx            ← Phase 2+
│   │   ├── HomeStack.tsx
│   │   ├── MatchStack.tsx
│   │   ├── HistoryStack.tsx
│   │   ├── AnalyticsStack.tsx
│   │   └── ProfileStack.tsx
│   └── tabs/
│       └── MainTabs.tsx
│
├── screens/
│   ├── Auth/                        ← Phase 2+
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── ForgotPasswordScreen.tsx
│   ├── Home/
│   │   ├── DashboardScreen.tsx
│   │   └── MatchSetupScreen.tsx
│   ├── Match/
│   │   ├── LiveScoringScreen.tsx
│   │   ├── MatchSummaryScreen.tsx   ← shows result + Share CTA
│   │   └── ShareCardScreen.tsx      ← full-screen card preview + export
│   ├── History/
│   │   ├── MatchHistoryScreen.tsx
│   │   └── MatchDetailScreen.tsx    ← includes reshare button
│   ├── Analytics/
│   │   └── AnalyticsDashboardScreen.tsx  ← Phase 3+
│   └── Profile/
│       ├── ProfileScreen.tsx
│       └── SettingsScreen.tsx       ← Live Sync toggle lives here
│
├── components/
│   ├── ui/                          ← Atomic primitives (GLOBAL.md §5)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── OfflineBanner.tsx
│   └── features/
│       ├── scoring/
│       │   ├── TeamCard.tsx         ← Team name + score display
│       │   ├── ServeIndicator.tsx   ← Highlights current server
│       │   ├── RotationTracker.tsx  ← Doubles serve order
│       │   ├── MatchTimer.tsx       ← Elapsed match time
│       │   ├── ActionBar.tsx        ← Undo, Timeout, Pause
│       │   └── RallyFeed.tsx        ← Scrollable point history
│       ├── share/
│       │   ├── MatchShareCard.tsx   ← The card component captured as image
│       │   ├── ShareCardFeed.tsx    ← 1:1 ratio — FB post / standard feed
│       │   └── ShareCardStory.tsx   ← 9:16 ratio — IG/FB Stories format
│       └── matches/
│           └── MatchCard.tsx        ← History list item
│
├── features/
│   ├── scoring/
│   │   └── scoringEngine.ts         ← Pure functions — serve rotation, fault, side-switch
│   ├── matches/
│   ├── tournaments/
│   ├── profiles/
│   └── analytics/
│
├── services/
│   ├── firebase/
│   │   ├── firebase.client.ts       ← Singleton init (GLOBAL.md §12 pattern)
│   │   ├── auth.service.ts          ← Phase 2+
│   │   ├── match.api.ts             ← Implements BackendAdapter<Match> — Phase 2+
│   │   └── user.api.ts              ← Implements BackendAdapter<UserProfile> — Phase 2+
│   ├── db/
│   │   ├── match.db.ts              ← SQLite local CRUD — Phase 1
│   │   └── sync.db.ts               ← mutation_queue table — Phase 2+
│   ├── sync/
│   │   └── match.sync.ts            ← Sync queue worker — Phase 2+
│   └── share/
│       └── shareCard.service.ts     ← view-shot capture + expo-sharing + media-library
│
├── hooks/
│   ├── useMatch.ts
│   ├── useMatchMock.ts
│   ├── useProfile.ts
│   ├── useProfileMock.ts
│   ├── useTournament.ts
│   └── useAnalytics.ts
│
├── store/
│   ├── authStore.ts                 ← session: FirebaseUser | null — Phase 2+
│   ├── uiStore.ts                   ← isOffline, toasts, liveSyncEnabled
│   └── activeMatchStore.ts          ← live UI state for current match only — Phase 1
│
├── mocks/
│   ├── match.mock.ts
│   ├── user.mock.ts
│   └── tournament.mock.ts
│
├── types/
│   ├── base.types.ts                ← BaseEntity, SyncStatus (GLOBAL.md §10)
│   ├── match.types.ts
│   ├── user.types.ts
│   ├── tournament.types.ts
│   └── event.types.ts               ← MatchEvent union type
│
├── utils/
│   ├── logger.ts
│   ├── formatDate.ts
│   └── shareCard.ts                 ← generates card data object from match
│
└── constants/
    ├── theme.ts                     ← Color tokens, typography (mirrors §10)
    ├── scoring.ts                   ← SCORE_LIMITS, MAX_TIMEOUTS, etc.
    └── firebase.ts                  ← Collection name constants
```

---

## 7. State Management — DULA Specific

> Follows GLOBAL.md §8. The table below clarifies DULA's specific state boundaries.

| State                                           | Tool           | Store / Hook                |
| ----------------------------------------------- | -------------- | --------------------------- |
| Firebase auth session                           | Zustand        | `authStore` (Phase 2+)      |
| Offline banner, toast queue                     | Zustand        | `uiStore`                   |
| Active match UI (score, timer, serve indicator) | Zustand        | `activeMatchStore`          |
| Live sync enabled toggle                        | Zustand        | `uiStore.liveSyncEnabled`   |
| Match history list (local)                      | TanStack Query | `useMatch` → `match.db.ts`  |
| Match history list (cloud, Phase 2+)            | TanStack Query | `useMatch` → `match.api.ts` |
| User profile (Phase 2+)                         | TanStack Query | `useProfile`                |
| Analytics / stats (Phase 3+)                    | TanStack Query | `useAnalytics`              |
| Local match cache                               | SQLite         | `match.db.ts`               |
| Share card format selection                     | useState       | local to `ShareCardScreen`  |
| Form fields (match setup)                       | useState       | local to `MatchSetupScreen` |

### `activeMatchStore` — scope definition

`activeMatchStore` holds **only** the real-time UI state of the match currently in progress:

```ts
type ActiveMatchStore = {
  matchId: string | null;
  score: { [teamId: string]: number };
  servingTeamId: string | null;
  servingPlayerId: string | null;
  timerSeconds: number;
  isRunning: boolean;
  timeoutsUsed: { [teamId: string]: number };
  setMatch: (matchId: string, initial: MatchSnapshot) => void;
  addPoint: (teamId: string) => void;
  undo: () => void;
  tick: () => void;
  clearMatch: () => void;
};
```

> ✅ `activeMatchStore` is for live UI state only — it is NOT the source of truth for match history.
> All committed match events are written to SQLite first, then synced to Firestore.

---

## 8. Data Models

> All entities extend `BaseEntity` from GLOBAL.md §10.

### UserProfile

```ts
// src/types/user.types.ts
import type { BaseEntity } from "./base.types";

export type UserProfile = BaseEntity & {
  displayName: string;
  email: string;
  avatar?: string;
  rating?: number;
  wins: number;
  losses: number;
  preferredHand: "left" | "right";
  clubId?: string;
};
```

### Match

```ts
// src/types/match.types.ts
import type { BaseEntity } from "./base.types";
import type { MatchEvent } from "./event.types";

export type MatchType = "singles" | "doubles";
export type MatchStatus = "setup" | "active" | "completed";
export type ScoreLimit = 11 | 15 | 21;

export type Team = {
  id: string;
  name: string;
  playerIds: string[];
  color?: string;
};

export type Match = BaseEntity & {
  ownerId: string;
  type: MatchType;
  status: MatchStatus;
  scoreLimit: ScoreLimit;
  winByTwo: boolean;
  rallyScoring: boolean;
  tournamentMode: boolean;
  teams: Team[];
  events: MatchEvent[];
  score: Record<string, number>;
  servingTeamId: string;
  servingPlayerId: string;
  startedAt?: string; // ISO 8601
  completedAt?: string; // ISO 8601
  durationSeconds?: number;
};
```

### MatchEvent

```ts
// src/types/event.types.ts
export type MatchEvent =
  | { type: "POINT"; teamId: string; timestamp: number; eventId: string }
  | { type: "FAULT"; playerId: string; timestamp: number; eventId: string }
  | { type: "TIMEOUT"; teamId: string; timestamp: number; eventId: string }
  | { type: "UNDO"; timestamp: number; eventId: string }
  | { type: "SIDE_SWITCH"; timestamp: number; eventId: string };
```

> Every event carries a unique `eventId` (UUID) for deduplication on sync.

### Tournament

```ts
// src/types/tournament.types.ts
import type { BaseEntity } from "./base.types";

export type TournamentFormat =
  | "single_elim"
  | "double_elim"
  | "round_robin"
  | "ladder";
export type TournamentStatus = "draft" | "active" | "completed";

export type Standing = {
  playerId: string;
  wins: number;
  losses: number;
  pointDiff: number;
};

export type Court = {
  id: string;
  name: string;
  matchId?: string;
};

export type Tournament = BaseEntity & {
  name: string;
  organizerId: string;
  format: TournamentFormat;
  status: TournamentStatus;
  players: string[];
  matches: string[];
  standings: Standing[];
  courts: Court[];
  startDate: string; // ISO 8601
};
```

---

## 9. Feature Breakdown

### A. Authentication & User Management

- Email/password login
- Google Sign-In
- Apple Sign-In (required for iOS App Store)
- Guest mode — local only, no Firestore sync
- Profile customization (name, avatar, preferred hand)
- Skill rating display
- Club/team association

**Notes:**

- **Phase 1:** No auth at all — app is fully local, no login required
- **Phase 2:** Firebase Auth added — guest mode, email, Google, Apple Sign-In
- Guest sessions store matches in SQLite only; migrate to cloud on account creation
- Avatar upload → Firebase Storage (Phase 2+)
- Auth state managed in `authStore` (Zustand) — created in Phase 2

---

### B. Match Setup

**Configuration Options:**

- Game type: Singles / Doubles
- Score limit: 11 / 15 / 21
- Win by 2: toggle
- Serve first: team selection
- Side switch: auto at defined thresholds
- Rally scoring: toggle
- Tournament mode: toggle (disables casual shortcuts)

**Constants (src/constants/scoring.ts):**

```ts
export const SCORE_LIMITS = [11, 15, 21] as const;
export const MAX_TIMEOUTS_PER_TEAM = 2;
export const SIDE_SWITCH_THRESHOLD = 6; // switch sides when leading team hits this in game 3
```

---

### C. Live Scoring System

**Core Requirements:**

- One-tap point scoring per team
- Haptic feedback on every score tap (`Expo Haptics`)
- Undo/redo — event-based, unlimited within match
- Automatic serve rotation (singles + doubles rules)
- Fault tracking
- Timeout tracking (2 per team, standard rules)
- Side-switch logic
- Visual serve indicator
- Match timer (elapsed)

**Scoring Engine — `src/features/scoring/scoringEngine.ts`:**

- Pure functions only — no side effects, fully unit-testable
- Implements: `addPoint`, `addFault`, `callTimeout`, `undo`, `applySideSwitch`
- Serve rotation rules:
  - First game: one fault before side-out
  - Doubles: both players serve before side-out
  - Side-out: serve passes to opposing team, score resets serve position

**Match Event System:**

- Every action produces a `MatchEvent` with a unique `eventId`
- Events append to local SQLite immediately — UI updates without any network
- `eventId` UUID ensures deduplication when sync queue processes them in Phase 2+
- Enables: undo/redo, replay, analytics

---

### D. Match History & Analytics

**Tracked Metrics:**

| Metric             | Description                       |
| ------------------ | --------------------------------- |
| Win/Loss Ratio     | Overall performance percentage    |
| Points Per Match   | Average scoring output            |
| Serve Accuracy     | Successful first serves           |
| Longest Win Streak | Consecutive point streak in match |
| Avg Match Duration | Time per completed match          |
| Head-to-Head Stats | Record vs specific opponents      |

**Visualizations (Phase 3 — Victory Native):**

- Win/loss trend line chart
- Weekly activity bar graph
- Serve success pie chart
- Rating progression timeline

---

### E. Social Share — Match Result Card (Phase 1)

**The share flow:**

```
MatchSummaryScreen
  → tap "Share Result"
  → ShareCardScreen (full-screen preview)
      ├── Toggle: Feed card (1:1) ↔ Story card (9:16)
      ├── "Save to Camera Roll" (expo-media-library)
      ├── "Share" → native share sheet (expo-sharing)
      │     └── FB post, IG Story, WhatsApp, Viber, etc.
      └── "Done" → back to summary
```

**Share card content (`MatchShareCard`):**

- DULA branding (logo + app name)
- Winner banner ("🏆 Team A Wins!")
- Final score — large, Montserrat ExtraBold
- Player names (both teams)
- Match config (singles/doubles, score limit)
- Match duration
- Date played
- Subtle court/pickleball graphic background

**Two card formats:**

| Format  | Ratio | Target platform             |
| ------- | ----- | --------------------------- |
| `feed`  | 1:1   | Facebook post, IG feed      |
| `story` | 9:16  | Facebook My Day, IG Stories |

**Implementation:**

- `MatchShareCard` and `ShareCardStory` are styled React Native `View` components
- `react-native-view-shot` captures the rendered view as a `.png`
- `expo-sharing` opens the native share sheet with the image
- `expo-media-library` saves to camera roll (requires permission prompt)
- No internet required — entirely local operation

**Share card service (`src/services/share/shareCard.service.ts`):**

```ts
export const shareCardService = {
  captureCard: (ref: RefObject<View>) => Promise<string>, // returns local file URI
  saveToGallery: (uri: string) => Promise<void>,
  shareImage: (uri: string) => Promise<void>,
};
```

---

### F. Live Sync — Spectator Mode (Toggle, Off by Default)

> **Disabled in Phase 1 & 2.** Controlled by `enable_live_sync` flag in `project.config.ts` and surfaced as a toggle in `SettingsScreen`.

When enabled (Phase 3+):

- Firestore `onSnapshot` listener on `matches/{matchId}`
- QR code per match (`react-native-qrcode-svg`)
- Public/private match toggle
- Spectator view (read-only)

**Why off by default:** Most players are on courts without reliable internet. The toggle lets power users opt in without breaking the offline-first experience for everyone else.

---

### G. Tournament System (Phase 4)

**Formats:** Single elimination · Double elimination · Round robin · Ladder

**Features:**

- Auto bracket generation from player list + seeding
- Court scheduling and assignment
- Admin control panel (score override, match reassignment)
- Live standings board (Firestore realtime)
- Tournament notifications via Cloud Functions + FCM

---

## 10. UI/UX Design System

### Design Principles

- Large touch targets — minimum 48×48pt for all match controls
- Minimal taps during gameplay — scoring is 1 tap, nothing modal
- Outdoor visibility — high contrast, Montserrat ExtraBold for scores
- Ambidextrous layout — score buttons on both sides of screen
- Dark mode default — preferred in bright outdoor environments

### Color Tokens (`src/constants/theme.ts`)

```ts
export const colors = {
  primary: "#4CAF50", // CTAs, active state, score tap
  secondary: "#FF9800", // Serve indicator, highlights
  background: "#FFFFFF", // Light mode background
  backgroundDark: "#121212", // Dark mode background
  surface: "#1E1E1E", // Cards in dark mode
  error: "#F44336", // Fault, timeout, error state
  onPrimary: "#FFFFFF", // Text/icon on primary
} as const;
```

### Typography (`src/constants/theme.ts`)

```ts
export const fonts = {
  heading: "Poppins_700Bold",
  body: "Inter_400Regular",
  scoreboard: "Montserrat_800ExtraBold",
  caption: "Inter_300Light",
} as const;
```

### UI Modes

- Light mode
- Dark mode (default)
- High contrast mode (Phase 5 — accessibility)

---

## 11. Offline-First Strategy

> Base sync strategy follows GLOBAL.md §13 exactly.

**DULA-specific rules:**

- A match in progress must **never** depend on internet connectivity
- All `MatchEvent` writes go to SQLite first — UI updates instantly
- Sync queue processes events FIFO to Firestore when online
- Conflict resolution: `eventId` deduplication prevents double-processing
- Local match state is **source of truth** during active play

**Sync triggers:**

- App foreground (`AppState`)
- Network reconnect (`NetInfo` + TanStack Query `onlineManager`)
- Pull-to-refresh on match history

---

## 12. Security & Data Integrity

> Base security rules follow GLOBAL.md §15.

### Firestore Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    match /matches/{matchId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.ownerId;
    }

    match /tournaments/{tournamentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.organizerId;
    }
  }
}
```

---

## 13. Performance Targets

| Metric               | Target      |
| -------------------- | ----------- |
| App launch (cold)    | < 2 seconds |
| Score update (local) | < 100ms     |
| Cloud sync latency   | < 500ms     |
| Frame rate           | 60 FPS      |
| JS bundle size       | < 3MB       |

**DULA-specific optimisations:**

- `TeamCard` and `ServeIndicator` are `React.memo` — re-render only on score/serve change
- `RallyFeed` uses `FlashList` — event log can grow large during a match
- Lottie animations preloaded on app start (score tap celebration)
- Firestore match listener unsubscribed on `LiveScoringScreen` unmount (Phase 3+ only)

---

## 14. Notifications System

> All notifications require Firebase Auth + FCM — **Phase 2+ only.**

| Trigger              | Message                                   | Phase |
| -------------------- | ----------------------------------------- | ----- |
| Match completed      | "Match finished. View your stats."        | 2+    |
| Match invite         | "Jordan invited you to a match"           | 3+    |
| Live score alert     | "Team A is leading 9–8 in your match"     | 3+    |
| Tournament update    | "Bracket updated — check your next match" | 4+    |
| Match start reminder | "Your game starts in 10 minutes"          | 4+    |

**Implementation (Phase 2+):**

- FCM for iOS and Android via `expo-notifications`
- Notification preferences stored in user profile
- Deep links navigate directly to the relevant match or tournament screen

---

## 15. Testing Strategy

### Unit Tests (Jest)

Priority targets:

- `src/features/scoring/scoringEngine.ts` — serve rotation, fault, side-switch, undo
- `activeMatchStore` state transitions
- Share card layout rendering (snapshot tests)
- Firestore rules — Firebase emulator (Phase 2+)

### E2E Tests (Detox / Maestro)

- Complete singles match flow → summary → share card generated
- Complete doubles match flow including serve rotation
- Undo sequence mid-match
- Share card format toggle (Feed vs Story)
- Save to camera roll
- Offline match → app close → reopen → match history intact
- (Phase 2+) Offline match → reconnect → sync to Firestore

### Manual QA Checklist

- [ ] Serve rotation accurate for singles and doubles
- [ ] Undo/redo works across all event types
- [ ] Match saves to SQLite on completion — survives app restart
- [ ] Share card generates in < 2 seconds
- [ ] Feed card (1:1) renders correctly — no clipping
- [ ] Story card (9:16) renders correctly — no clipping
- [ ] Save to camera roll succeeds (permission prompt handled)
- [ ] Native share sheet opens with correct image attached
- [ ] Dark mode renders all components correctly
- [ ] Live sync toggle shows "Coming soon" in Phase 1

---

## 16. Deployment Pipeline

```bash
# Development
npx expo start

# Android production build
eas build --platform android --profile production

# iOS production build
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

### CI/CD (GitHub Actions)

| Trigger         | Action                              |
| --------------- | ----------------------------------- |
| PR opened       | lint, `tsc --noEmit`, unit tests    |
| Merge to `main` | EAS build trigger, Sentry release   |
| Tag `v*.*.*`    | Production build + store submission |

### Distribution

| Stage      | Platform                                               |
| ---------- | ------------------------------------------------------ |
| Internal   | Expo Go / Dev Client                                   |
| Beta       | Firebase App Distribution (Android) / TestFlight (iOS) |
| Production | Google Play Store / Apple App Store                    |

---

## 17. Phase Roadmap

### Phase 1 — MVP (4–6 Weeks)

**Goal:** Offline-first scoring app with social share card. No internet required to play.

> **Core loop:** Set up match → Score locally → See match summary → Share image card to FB / IG Stories / any social platform

**Core deliverables:**

- [ ] Expo project initialized, EAS configured, path aliases set up
- [ ] Folder structure scaffolded per §6
- [ ] `project.config.ts` written
- [ ] Navigation scaffold: `types.ts`, `RootNavigator`, all stacks + MainTabs (no auth gate — local only)
- [ ] `uiStore`, `activeMatchStore` (Zustand) — no `authStore` until Phase 2
- [ ] `BaseEntity` + all DULA types defined
- [ ] Mock data: `match.mock.ts`, `user.mock.ts`
- [ ] Mock hooks: `useMatchMock`, `useProfileMock`
- [ ] `scoringEngine.ts` — pure functions, Jest coverage (serve rotation, fault, side-switch, undo)
- [ ] `MatchSetupScreen` — singles/doubles, score limit, win-by-2, rally toggle
- [ ] `LiveScoringScreen` — scoreboard, serve indicator, action bar, haptics
- [ ] `MatchSummaryScreen` — final score, match stats, **Share Card CTA**
- [ ] `ShareCardScreen` — full-screen card preview, format toggle (Feed / Story), export + save
- [ ] `DashboardScreen` — recent matches list, quick-start button
- [ ] `MatchHistoryScreen` + `MatchDetailScreen` — past matches with reshare button
- [ ] SQLite schema: `matches` table, WAL mode on
- [ ] `match.db.ts` — local CRUD (no sync queue needed in Phase 1)
- [ ] Dark mode default
- [ ] `OfflineBanner` wired to `uiStore.isOffline`

**Share card deliverables:**

- [ ] `ShareCard` component — two layouts: Feed (1:1) and Story (9:16)
- [ ] Renders: team names, final score, date, match duration, DULA branding watermark
- [ ] `react-native-view-shot` captures card as PNG
- [ ] `expo-sharing` opens native share sheet (FB, IG, WhatsApp, Messages, etc.)
- [ ] `expo-media-library` saves card to camera roll
- [ ] Share card works 100% offline — no network call needed to generate

**Live sync toggle (off by default):**

- [ ] `enable_live_sync: false` in `project.config.ts`
- [ ] Settings screen has toggle — visible but disabled with "Coming soon" label in Phase 1
- [ ] No Firestore reads/writes in Phase 1 — zero Firebase dependency

---

### Phase 2 — Accounts & Cloud Backup (3–4 Weeks)

**Goal:** Optional accounts, cloud match backup, history sync across devices. Live sync still off by default.

**Deliverables:**

- [ ] Firebase Auth (Email, Google, Apple, Guest)
- [ ] `authStore` wired to Firebase session — `RootNavigator` now has auth gate
- [ ] `auth.service.ts` — sign in, sign up, sign out, guest mode
- [ ] `match.api.ts` implementing `BackendAdapter<Match>`
- [ ] `user.api.ts` implementing `BackendAdapter<UserProfile>`
- [ ] `match.sync.ts` — sync queue worker, exponential backoff (GLOBAL.md §13)
- [ ] `mutation_queue` SQLite table added
- [ ] Firestore security rules deployed + Firebase emulator tested
- [ ] `ProfileScreen` with avatar upload to Firebase Storage
- [ ] Guest → account migration (local matches transferred on sign-up)
- [ ] Match history syncs across devices when signed in
- [ ] Share card updated: optionally includes player name when signed in

---

### Phase 3 — Live Sync & Analytics (4 Weeks)

**Goal:** Enable live sync for spectators (opt-in toggle), plus player analytics and performance data.

**Live sync deliverables:**

- [ ] `enable_live_sync` toggle made functional in Settings (was "Coming soon" in Phase 1–2)
- [ ] Firestore `onSnapshot` listener on `matches/{matchId}` for spectator view
- [ ] `SpectatorScreen` — read-only live score view
- [ ] QR code generation per match (`react-native-qrcode-svg`)
- [ ] Public / private match toggle
- [ ] Web viewer URL (dula.app/match/{id}) — separate React app, same Firestore data

**Analytics deliverables:**

- [ ] Cloud Functions for stats aggregation (win/loss, streaks, avg duration)
- [ ] `useAnalytics` hook with TanStack Query
- [ ] `AnalyticsDashboardScreen` — charts via Victory Native
- [ ] Head-to-head comparison view
- [ ] Club/league rankings list
- [ ] Enhanced share card — includes win streak, rating badge

---

### Phase 4 — Tournament Engine (6–8 Weeks)

**Goal:** Full tournament management for clubs and organizers.

**Deliverables:**

- [ ] Tournament data model + Firestore schema (see SCHEMA.md)
- [ ] Bracket generation algorithms (single elim, double elim, round robin)
- [ ] Tournament creation wizard
- [ ] `BracketView` component
- [ ] Court scheduler UI
- [ ] Admin panel (match assignment, score override)
- [ ] Live standings screen (Firestore realtime)
- [ ] Role-based Firestore rules for organizers
- [ ] Tournament notification Cloud Functions

---

### Phase 5 — Production Hardening (3–4 Weeks)

**Goal:** Store-ready, reliable, polished.

**Deliverables:**

- [ ] Full Detox E2E suite
- [ ] Sentry + Crashlytics integrated
- [ ] App icons, splash screen, store screenshots
- [ ] Accessibility audit (screen reader, font scaling, contrast)
- [ ] Privacy policy URL live
- [ ] Beta builds distributed (TestFlight + Firebase App Distribution)
- [ ] Production builds submitted to both stores

---

## 18. Monetization Strategy

> All monetization is post-MVP. Core scoring is free.

| Stream                   | Description                                    |
| ------------------------ | ---------------------------------------------- |
| Premium Analytics        | Advanced stats, heatmaps, export — paid tier   |
| Club Subscriptions       | Club admin tools, member management            |
| Tournament Organizer Pro | Bracket tools, scheduling, multi-court support |
| White-Label              | Custom-branded DULA for leagues/associations   |
| Ad-Free Tier             | Remove any future ads                          |

---

## 19. Future Enhancements

| Feature               | Description                                 |
| --------------------- | ------------------------------------------- |
| Apple Watch Companion | Score tap from wrist                        |
| WearOS Support        | Android smartwatch score controls           |
| Voice Scoring         | "Hey DULA, point for team A"                |
| AI Match Insights     | Auto-generated post-game summaries          |
| Rally Detection       | Camera-based long-rally identification      |
| Coaching Suggestions  | AI serve and positioning recommendations    |
| AR Scoreboard         | Live AR score overlay on court              |
| Web Viewer            | Public match page at `dula.app/match/{id}`  |
| Bluetooth Court Sync  | Multi-device sync on court without internet |

---

_Last updated: May 2026 — v1.1 (offline-first pivot) · DULA dev team_
_Rules not listed here → defer to GLOBAL.md_
