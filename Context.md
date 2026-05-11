# CONTEXT.md — DULA

> Hand-off note — where we stopped, what's next.
> Overwrite this file at the end of every session.
> Read at session start (2nd — after LESSONS.md).

---

## Current Status

**Phase:** 1 — Implementation in progress (Stage 14G complete)
**Last action:** Implemented Settings and Profile screens (Stage 14G)
**Date:** May 11, 2026

---

## What Was Completed This Session

- [x] Phase 1 Scaffold (Stages 1–11)
- [x] Scoring Engine logic + unit tests (Stage 12)
- [x] Atomic UI Primitives (Button, Card, LoadingSpinner, EmptyState, ErrorState) (Stage 13)
- [x] Dashboard Screen & MatchCard component (Stage 14A)
- [x] Match Setup Screen with SQLite integration (Stage 14B)
- [x] Live Scoring Screen with real-time updates and persistence (Stage 14C)
- [x] Match Summary Screen with winner banner and statistics (Stage 14D)
- [x] Share Card components and screen with sharing service (Stage 14E)
- [x] Match History and Match Detail screens (Stage 14F)
- [x] Settings and Profile screens with local stats (Stage 14G)

---

## Next Action

> Starting Stage 15: Real Hook Cutover

**Step 1 of Stage 15:** Build `src/hooks/useMatch.ts`:

- [ ] Create `useMatch` hook using TanStack Query
- [ ] Connect `useMatch` to `matchDb.ts` for real SQLite fetching
- [ ] Swap `useMatchMock` for `useMatch` in `DashboardScreen` and `MatchHistoryScreen`

---

## Phase 1 Core Loop (reminder)

```
Match Setup → Live Scoring (SQLite) → Match Summary → Share Card
                                                           ↓
                                             Feed (1:1) or Story (9:16)
                                                           ↓
                                         Share sheet or save to camera roll
```

---

## Open Items

- [ ] GitHub repo URL — link when created
- [ ] Firebase project config values — fill `.env` when shared
- [ ] Bundle ID confirmed (`com.dula.app` is placeholder)
- [ ] Rating system decision deferred to Phase 3 (DECISIONS.md D-005)
- [ ] Font license check — Poppins + Inter + Montserrat (all Google Fonts, free)

---

## Key Files

| File                | Location                                   |
| ------------------- | ------------------------------------------ |
| `PROJECT.md`        | project root                               |
| `GLOBAL.md`         | project root (or global folder)            |
| `DECISIONS.md`      | project root                               |
| `SCHEMA.md`         | project root                               |
| `project.config.ts` | project root                               |
| `CONTEXT.md`        | project root (this file)                   |
| `LESSONS.md`        | global (shared across projects)            |
| `SUMMARY.md`        | project root (create on first session)     |
| `tasks/todo.md`     | project root (create when building starts) |

---

_Last updated: May 2026_
