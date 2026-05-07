# CONTEXT.md — DULA

> Hand-off note — where we stopped, what's next.
> Overwrite this file at the end of every session.
> Read at session start (2nd — after LESSONS.md).

---

## Current Status

**Phase:** 1 — Planning complete, ready to build
**Last action:** All planning documents created (PROJECT.md, DECISIONS.md, SCHEMA.md, project.config.ts)
**Date:** May 2026

---

## What Was Completed This Session

- [x] Reviewed original DULA roadmap document
- [x] Reviewed GLOBAL.md v3.3
- [x] Identified and resolved all conflicts between roadmap and GLOBAL.md
- [x] Decided database: Firestore (see DECISIONS.md D-001)
- [x] Closed all open architectural questions (D-001 through D-010)
- [x] Created `PROJECT.md` — GLOBAL-compliant, all conflicts resolved
- [x] Created `DECISIONS.md` — all decisions logged with rationale
- [x] Created `SCHEMA.md` — Firestore + SQLite + sync queue schemas
- [x] Created `project.config.ts` — session bootstrap file
- [x] Created `CONTEXT.md` — this file
- [x] **Pivoted Phase 1:** offline-first scoring + social share card (see D-009, D-010)
- [x] Live sync deferred to Phase 3, toggle visible but disabled from Phase 1

---

## Next Action

> When the user says "let's start building" — begin here.

**Step 1 of Phase 1:** Expo project bootstrap

Follow GLOBAL.md §18 (Enforced Build Workflow). Write plan to `tasks/todo.md` first, check in before touching code.

Bootstrap checklist:

- `npx create-expo-app dula --template blank-typescript`
- Configure `tsconfig.json` path aliases (`@/`)
- Configure `babel.config.js` with `babel-plugin-module-resolver`
- Install dependencies:
  - Navigation: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
  - State: `zustand`, `@tanstack/react-query`
  - Styling: `nativewind`, `tailwindcss`
  - DB: `expo-sqlite`
  - Share: `react-native-view-shot`, `expo-sharing`, `expo-media-library`
  - Haptics: `expo-haptics`
  - Animations: `react-native-reanimated`, `lottie-react-native`
  - Fonts: `@expo-google-fonts/poppins`, `@expo-google-fonts/inter`, `@expo-google-fonts/montserrat`
- Scaffold full folder structure per PROJECT.md §6
- Write `src/navigation/types.ts` with all param lists
- Wire `RootNavigator` (no auth gate — mounts `MainTabs` directly in Phase 1)
- Initialize SQLite (`matches` table only — no `mutation_queue` until Phase 2)

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
