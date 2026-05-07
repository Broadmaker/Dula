# DECISIONS.md — DULA

> Architectural decisions with full rationale.
> Read at session start (3rd, alongside SCHEMA.md).
> Never delete a decision — superseded decisions get a ~~strikethrough~~ + replacement entry.

---

## Decision Index

| ID    | Title                                    | Status    | Date     |
| ----- | ---------------------------------------- | --------- | -------- |
| D-001 | Database — Firestore vs Supabase         | ✅ Closed | May 2026 |
| D-002 | Local DB — SQLite library                | ✅ Closed | May 2026 |
| D-003 | Styling — NativeWind vs RN Paper         | ✅ Closed | May 2026 |
| D-004 | Navigation — Router choice               | ✅ Closed | May 2026 |
| D-005 | Rating system                            | ⏳ Open   | —        |
| D-006 | Monorepo vs single project               | ✅ Closed | May 2026 |
| D-007 | Tablet layout support                    | ✅ Closed | May 2026 |
| D-008 | Web viewer — which phase                 | ✅ Closed | May 2026 |
| D-009 | Live sync — opt-in toggle                | ✅ Closed | May 2026 |
| D-010 | Phase 1 core loop — offline + share card | ✅ Closed | May 2026 |

---

## D-001 — Database: Firestore vs Supabase

**Status:** ✅ Closed
**Decision:** **Firestore**

### Context

DULA needed a cloud database. Two viable options were evaluated: Firestore (Firebase) and Supabase (PostgreSQL).

### Evaluation

| Factor                  | Firestore                            | Supabase                                |
| ----------------------- | ------------------------------------ | --------------------------------------- |
| Real-time sync          | Native `onSnapshot` — built for this | Layer on top of Postgres — more latency |
| Offline persistence     | `persistentLocalCache()` — built-in  | No native support — extra setup         |
| Event-sourced match log | Natural fit — documents are flexible | Awkward — relational tables resist it   |
| Complex analytics (Ph3) | Needs Cloud Functions                | SQL shines here                         |
| Schema flexibility      | Schema-less — easy to evolve types   | Migrations required for every change    |
| GLOBAL.md alignment     | Full Firebase section defined (§12)  | Supabase also covered — either works    |
| Firebase project        | Already set up by dev                | Not set up                              |

### Rationale

DULA's core product is a **live scoring app**. Real-time sync and offline persistence are must-haves from Phase 1, not Phase 3. Firestore solves both natively with near-zero configuration.

Supabase would be the better pick if DULA were primarily an analytics platform. Phase 3 analytics can be served via Cloud Functions aggregating Firestore data — this is a solved pattern.

### Consequences

- All Firestore document types must be manually defined in `src/types/` (schema-less)
- Complex analytics queries in Phase 3 require Cloud Functions or a denormalized read model
- Firebase project must have Firestore + Auth + Storage + Functions enabled

---

## D-002 — Local DB: SQLite Library

**Status:** ✅ Closed
**Decision:** **expo-sqlite (Next API)**

### Context

GLOBAL.md §4 already mandates `expo-sqlite (Next API)` with `useSQLiteContext` and WAL mode. This was listed as an open question in the original DULA roadmap — it is not a question; it is settled by GLOBAL.

### Rationale

- Managed Expo workflow — no native build steps
- `useSQLiteContext` integrates cleanly with React component tree
- WAL mode enables concurrent reads without blocking writes
- `runAsync` keeps writes off the JS thread

### Consequences

- DB initialized once on app start via `SQLiteProvider` in `App.tsx`
- All tables created with `IF NOT EXISTS` on first run
- WAL enabled: `PRAGMA journal_mode=WAL;` on init

---

## D-003 — Styling: NativeWind vs React Native Paper

**Status:** ✅ Closed
**Decision:** **NativeWind v4 only**

### Context

Original DULA roadmap listed React Native Paper as the UI component library. GLOBAL.md §4 mandates NativeWind v4 with `className` only, and lists `StyleSheet.create` as an anti-pattern. React Native Paper uses StyleSheet internally — direct conflict.

### Options Evaluated

| Option                  | Pros                                       | Cons                                                       |
| ----------------------- | ------------------------------------------ | ---------------------------------------------------------- |
| NativeWind only         | GLOBAL-compliant, consistent, full control | More custom component work                                 |
| React Native Paper only | Pre-built rich components                  | Conflicts with GLOBAL anti-patterns                        |
| Both (hybrid)           | Best of both                               | Inconsistent styling, double theming, maintenance overhead |

### Rationale

NativeWind v4 is the standard defined in GLOBAL.md. Introducing React Native Paper creates two parallel styling systems and violates the `StyleSheet.create` anti-pattern. For a scoring app, the UI is simple enough that custom NativeWind components are the right call — we are not building a complex enterprise form suite.

Custom primitives are built in `src/components/ui/` and reused throughout.

### Consequences

- All components use `className` prop with Tailwind classes
- No `StyleSheet.create` anywhere in the codebase
- Custom `Button`, `Card`, `EmptyState`, `ErrorState`, `LoadingSpinner`, `OfflineBanner` built in Phase 1
- Typography: Poppins + Inter + Montserrat loaded via `expo-font` or `@expo-google-fonts`

---

## D-004 — Navigation: Router Choice

**Status:** ✅ Closed
**Decision:** **React Navigation v6+ (NativeStack)**

### Context

GLOBAL.md §7 explicitly forbids Expo Router and file-based routing. The original DULA roadmap mentioned an `app/` directory (Expo Router entry point) — this is removed.

### Rationale

GLOBAL.md is authoritative. React Navigation with typed param lists in `src/navigation/types.ts` is the standard for all projects in this profile.

### Consequences

- No `app/` directory exists in the project
- All routes defined in `src/navigation/types.ts` before screens are created
- `RootNavigator` gates auth vs app routes based on `authStore.session`

---

## D-005 — Rating System: ELO vs TrueSkill vs Custom

**Status:** ⏳ Open — defer to Phase 3

### Context

DULA plans to display player skill ratings. The calculation method has not been decided.

### Options

| System    | Pros                                   | Cons                                         |
| --------- | -------------------------------------- | -------------------------------------------- |
| ELO       | Simple, well-understood                | Designed for 1v1, less accurate for doubles  |
| TrueSkill | Handles team games well (Microsoft)    | More complex, licensing ambiguity for mobile |
| Custom    | Tailored to pickleball scoring nuances | Requires tuning, no established baseline     |

### Decision criteria (when we get here)

- Does the community expect ELO (familiar to most players)?
- Is doubles-aware rating important for Phase 3 launch?

**Revisit at Phase 3 planning.**

---

## D-006 — Monorepo vs Single Expo Project

**Status:** ✅ Closed
**Decision:** **Single Expo project**

### Context

Option to use Turborepo/Nx for a potential future web viewer alongside the mobile app.

### Rationale

Phase 1–3 is mobile only. A monorepo adds tooling complexity with zero current benefit. If a web viewer is introduced in Phase 3/4, evaluate migration at that point — it is not a blocking concern now.

### Consequences

- Single `package.json`, single Expo project
- Web viewer (if built) would be a separate repo until monorepo migration is justified

---

## D-007 — Tablet Layout Support

**Status:** ✅ Closed
**Decision:** **Defer — phone layout only for Phase 1–3**

### Rationale

Target users are players on pickleball courts holding phones. Tablet optimization adds layout complexity (responsive breakpoints, split-view) with minimal user impact in early phases. Revisit if tournament organizer use case demands it (Phase 4 admin panel may benefit from tablet layout).

---

## D-008 — Web Viewer: Which Phase

**Status:** ✅ Closed
**Decision:** **Phase 3**

### Context

Spectators need a way to follow live scores without installing the app. A web viewer at `dula.app/match/{id}` (or similar) enables this.

### Rationale

- Phase 1: No cloud sync yet — web viewer impossible
- Phase 2: Cloud sync added, but web viewer is scope creep during auth/sync stabilization
- Phase 3: Real-time data is live and stable — web viewer is a natural companion to the QR share feature from Phase 2

### Consequences

- Web viewer is a separate React app (not in the RN project)
- Uses Firebase JS SDK with `onSnapshot` on `matches/{matchId}`
- Shares Firestore data model types — consider a `shared/types` package at that point

---

## D-009 — Live Sync: Opt-In Toggle, Off by Default

**Status:** ✅ Closed
**Decision:** **Live sync is a feature flag — `enable_live_sync: false` — visible in Settings but disabled until Phase 3**

### Context

Most pickleball players play on courts with poor or no connectivity. Real-time spectator sync is a nice-to-have, not a must-have for day-one users. The original roadmap included live scoring as a core Phase 1 feature — user feedback during planning shifted this.

### Rationale

- Players want an app that works 100% offline with zero setup
- Live sync requires Firestore, auth, and realtime listeners — adds complexity and potential failure points in Phase 1
- Keeping the toggle visible (but disabled) communicates the feature is coming without blocking the MVP
- Phase 3 is the right moment: Firestore is stable from Phase 2, auth is working, realtime is a natural next add-on

### Implementation

```ts
// project.config.ts
enable_live_sync: false  // Phase 1 + 2

// Settings screen
<Toggle
  label="Live match sync"
  value={false}
  disabled={true}
  caption="Coming soon"
/>
```

### Consequences

- Zero Firestore reads/writes in Phase 1 — pure SQLite
- `mutation_queue` table not needed until Phase 2
- `SpectatorScreen` and QR code share deferred to Phase 3

---

## D-010 — Phase 1 Core Loop: Offline Scoring + Social Share Card

**Status:** ✅ Closed
**Decision:** **Phase 1 = score locally → share image card to FB / IG Stories / social. No cloud dependency.**

### Context

Original roadmap was broader — cloud sync, spectator mode, analytics all mixed into early phases. User clarified that most players are comfortable with offline-first apps and mainly want to share their match result socially (Facebook, Instagram Stories, WhatsApp).

### Core Loop

```
Match Setup → Live Scoring (local) → Match Summary → Share Card
                                                           ↓
                                         Feed card (1:1) or Story card (9:16)
                                                           ↓
                                         Native share sheet or save to camera roll
```

### Share Card Spec

| Property       | Value                                                   |
| -------------- | ------------------------------------------------------- |
| Formats        | Feed (1:1 square) + Story (9:16 portrait)               |
| Library        | `react-native-view-shot` — captures RN component as PNG |
| Share          | `expo-sharing` — native OS share sheet                  |
| Save           | `expo-media-library` — saves to camera roll             |
| Content        | Team names, final score, date, duration, DULA logo      |
| Network needed | ❌ None — fully offline                                 |

### Consequences

- `ShareCardScreen` is a first-class screen in Phase 1 — not a Phase 3 addition
- Share card component built as a pure display component (no hooks, no async)
- Two layout variants required from day one: `feed` and `story`
- `MatchSummaryScreen` always shows Share CTA as the primary action after a match ends
- Past matches in `MatchDetailScreen` include a reshare button

---

_Last updated: May 2026 · DULA dev team_
