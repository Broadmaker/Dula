# CONTEXT.md — DULA

> Hand-off note — where we stopped, what's next.
> Overwrite this file at the end of every session.
> Read at session start (2nd — after LESSONS.md).

---

## Current Status

**Phase:** 1 — Stage 14 complete, Stage 15 next
**Last action:** All feature components and screens built and verified clean
**Date:** May 2026

---

## What Was Completed This Session

- [x] Stage 14 — All 6 feature components built and audited
- [x] Stage 14 — All 6 remaining screens built and audited
- [x] `settingsStore.ts` created
- [x] `matchDb.deleteMatch` soft delete added
- [x] `LOCAL_USER_ID` constant added
- [x] All verified: `tsc --noEmit` ✅ · `expo lint` ✅ · `jest` 16/16 ✅

---

## Next Action

**Stage 15 — Real Hook Cutover**

Build `src/hooks/useMatch.ts` following GLOBAL.md §9 TanStack Query pattern:

### Step 1 — Create `useMatch.ts`

```ts
// src/hooks/useMatch.ts
import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { matchDb } from "@/services/db/matchDb";

export const matchKeys = {
  all: () => ["matches"] as const,
  list: () => ["matches", "list"] as const,
  detail: (uuid: string) => ["matches", "detail", uuid] as const,
};

export function useMatchList() { ... }
export function useMatchDetail(uuid: string) { ... }
```

### Step 2 — Swap mock hooks in screens

| Screen               | From                | To             |
| -------------------- | ------------------- | -------------- |
| `DashboardScreen`    | `useMatchMock`      | `useMatchList` |
| `MatchHistoryScreen` | direct SQLite calls | `useMatchList` |

### Step 3 — Verify shape parity

Mock hook and real hook must return same shape — zero screen changes required.

---

## Open Items

- [ ] GitHub repo URL — link when created
- [ ] Firebase project config values — fill `.env` when Phase 2 starts
- [ ] Bundle ID confirmed (`com.dula.app` is placeholder)
- [ ] Rating system decision deferred to Phase 3 (DECISIONS.md D-005)
- [ ] `hapticsEnabled` from `settingsStore` not yet wired to `LiveScoringScreen` haptic calls
- [ ] `soundEnabled` from `settingsStore` — sound effects not yet implemented (Phase 2)
- [ ] Display name in `ProfileScreen` not persisted — resets on app restart (AsyncStorage in Phase 2)

## Key Files

| File                | Location                 |
| ------------------- | ------------------------ |
| `PROJECT.md`        | project root             |
| `GLOBAL.md`         | project root             |
| `DECISIONS.md`      | project root             |
| `SCHEMA.md`         | project root             |
| `project.config.ts` | project root             |
| `CONTEXT.md`        | project root (this file) |
| `LESSONS.md`        | global                   |
| `SUMMARY.md`        | project root             |
| `tasks/todo.md`     | project root             |

---

_Last updated: May 2026_

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
