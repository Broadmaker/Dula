# SCHEMA.md — DULA

> Living database map — Firestore collections, SQLite tables, indexes, and relationships.
> Read at session start (3rd, alongside DECISIONS.md).
> Update this file any time a collection, table, field, or index changes.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Firestore Schema](#2-firestore-schema)
3. [SQLite Schema (Local Cache)](#3-sqlite-schema-local-cache)
4. [Sync Queue Table](#4-sync-queue-table)
5. [Relationships & Data Flow](#5-relationships--data-flow)
6. [Firestore Security Rules](#6-firestore-security-rules)
7. [Index Strategy](#7-index-strategy)
8. [Schema Changelog](#8-schema-changelog)

---

## 1. Overview

DULA uses a two-layer data strategy:

| Layer           | Technology           | Purpose                                              |
| --------------- | -------------------- | ---------------------------------------------------- |
| Local (primary) | expo-sqlite Next API | Offline-first reads/writes, source of truth in-match |
| Cloud (sync)    | Firestore            | Persistence, real-time spectator sync, cross-device  |

**Write order:** SQLite first → sync queue → Firestore (eventual consistency)
**Read order:** SQLite always — Firestore used for realtime listeners (spectator) and initial hydration on new device

---

## 2. Firestore Schema

### Collection: `users`

**Path:** `/users/{userId}`
**Document ID:** Firebase Auth UID

```ts
{
  // BaseEntity fields (mapped from SQLite — uuid = Firebase Auth UID for users)
  uuid: string; // Firebase Auth UID
  server_id: string; // same as uuid for users
  sync_status: SyncStatus;
  sync_error: string | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601

  // UserProfile fields
  displayName: string;
  email: string;
  avatar: string | null; // Firebase Storage URL
  rating: number | null;
  wins: number;
  losses: number;
  preferredHand: "left" | "right";
  clubId: string | null;
}
```

---

### Collection: `matches`

**Path:** `/matches/{matchId}`
**Document ID:** client-generated UUID (`uuid` field)

```ts
{
  // BaseEntity fields
  uuid:          string       // client UUID — also the document ID
  server_id:     string | null
  sync_status:   SyncStatus
  sync_error:    string | null
  created_at:    string       // ISO 8601
  updated_at:    string       // ISO 8601

  // Match fields
  ownerId:       string       // Firebase Auth UID
  type:          'singles' | 'doubles'
  status:        'setup' | 'active' | 'completed'
  scoreLimit:    11 | 15 | 21
  winByTwo:      boolean
  rallyScoring:  boolean
  tournamentMode: boolean
  isPublic:      boolean      // controls spectator visibility

  teams: [
    {
      id:        string
      name:      string
      playerIds: string[]
      color:     string | null
    }
  ]

  events: [
    {
      eventId:   string       // UUID — deduplication key on sync
      type:      'POINT' | 'FAULT' | 'TIMEOUT' | 'UNDO' | 'SIDE_SWITCH'
      teamId:    string | null
      playerId:  string | null
      timestamp: number       // Unix ms
    }
  ]

  score: {
    [teamId: string]: number
  }

  servingTeamId:   string
  servingPlayerId: string
  startedAt:       string | null   // ISO 8601
  completedAt:     string | null   // ISO 8601
  durationSeconds: number | null
}
```

**Subcollection (Phase 2+):** `/matches/{matchId}/spectators/{userId}`

```ts
{ joinedAt: string, userId: string }
```

---

### Collection: `tournaments`

**Path:** `/tournaments/{tournamentId}`
**Document ID:** client-generated UUID

```ts
{
  // BaseEntity fields
  uuid:        string
  server_id:   string | null
  sync_status: SyncStatus
  sync_error:  string | null
  created_at:  string
  updated_at:  string

  // Tournament fields
  name:        string
  organizerId: string        // Firebase Auth UID
  format:      'single_elim' | 'double_elim' | 'round_robin' | 'ladder'
  status:      'draft' | 'active' | 'completed'
  isPublic:    boolean
  players:     string[]      // array of UUIDs
  matches:     string[]      // array of match UUIDs

  standings: [
    {
      playerId:  string
      wins:      number
      losses:    number
      pointDiff: number
    }
  ]

  courts: [
    {
      id:      string
      name:    string
      matchId: string | null
    }
  ]

  startDate: string          // ISO 8601
}
```

---

## 3. SQLite Schema (Local Cache)

> All tables follow GLOBAL.md §10 — required fields on every table.
> WAL mode enabled on DB init: `PRAGMA journal_mode=WAL;`

### Table: `users`

```sql
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid          TEXT    NOT NULL UNIQUE,
  server_id     TEXT,
  sync_status   TEXT    NOT NULL DEFAULT 'pending',
  sync_error    TEXT,
  created_at    TEXT    NOT NULL,
  updated_at    TEXT    NOT NULL,

  display_name  TEXT    NOT NULL,
  email         TEXT    NOT NULL,
  avatar        TEXT,
  rating        REAL,
  wins          INTEGER NOT NULL DEFAULT 0,
  losses        INTEGER NOT NULL DEFAULT 0,
  preferred_hand TEXT   NOT NULL DEFAULT 'right',
  club_id       TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_uuid      ON users (uuid);
CREATE INDEX IF NOT EXISTS idx_users_server_id ON users (server_id);
```

---

### Table: `matches`

```sql
CREATE TABLE IF NOT EXISTS matches (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid            TEXT    NOT NULL UNIQUE,
  server_id       TEXT,
  sync_status     TEXT    NOT NULL DEFAULT 'pending',
  sync_error      TEXT,
  created_at      TEXT    NOT NULL,
  updated_at      TEXT    NOT NULL,

  owner_id        TEXT    NOT NULL,
  type            TEXT    NOT NULL,          -- 'singles' | 'doubles'
  status          TEXT    NOT NULL DEFAULT 'setup',
  score_limit     INTEGER NOT NULL DEFAULT 11,
  win_by_two      INTEGER NOT NULL DEFAULT 1, -- boolean
  rally_scoring   INTEGER NOT NULL DEFAULT 0,
  tournament_mode INTEGER NOT NULL DEFAULT 0,
  is_public       INTEGER NOT NULL DEFAULT 0,

  teams_json      TEXT    NOT NULL,          -- JSON: Team[]
  events_json     TEXT    NOT NULL DEFAULT '[]', -- JSON: MatchEvent[]
  score_json      TEXT    NOT NULL DEFAULT '{}', -- JSON: Record<teamId, number>

  serving_team_id   TEXT,
  serving_player_id TEXT,
  started_at        TEXT,
  completed_at      TEXT,
  duration_seconds  INTEGER
);

CREATE INDEX IF NOT EXISTS idx_matches_uuid        ON matches (uuid);
CREATE INDEX IF NOT EXISTS idx_matches_server_id   ON matches (server_id);
CREATE INDEX IF NOT EXISTS idx_matches_sync_status ON matches (sync_status);
CREATE INDEX IF NOT EXISTS idx_matches_owner_id    ON matches (owner_id);
CREATE INDEX IF NOT EXISTS idx_matches_status      ON matches (status);
CREATE INDEX IF NOT EXISTS idx_matches_created_at  ON matches (created_at DESC);
```

> `teams_json`, `events_json`, `score_json` store serialized JSON.
> Parse with `JSON.parse()` in `match.db.ts` — never access raw JSON outside the service layer.

---

### Table: `tournaments`

```sql
CREATE TABLE IF NOT EXISTS tournaments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid          TEXT    NOT NULL UNIQUE,
  server_id     TEXT,
  sync_status   TEXT    NOT NULL DEFAULT 'pending',
  sync_error    TEXT,
  created_at    TEXT    NOT NULL,
  updated_at    TEXT    NOT NULL,

  name          TEXT    NOT NULL,
  organizer_id  TEXT    NOT NULL,
  format        TEXT    NOT NULL,   -- 'single_elim' | 'double_elim' | 'round_robin' | 'ladder'
  status        TEXT    NOT NULL DEFAULT 'draft',
  is_public     INTEGER NOT NULL DEFAULT 0,
  start_date    TEXT    NOT NULL,

  players_json   TEXT NOT NULL DEFAULT '[]',   -- JSON: string[]
  matches_json   TEXT NOT NULL DEFAULT '[]',   -- JSON: string[]
  standings_json TEXT NOT NULL DEFAULT '[]',   -- JSON: Standing[]
  courts_json    TEXT NOT NULL DEFAULT '[]'    -- JSON: Court[]
);

CREATE INDEX IF NOT EXISTS idx_tournaments_uuid        ON tournaments (uuid);
CREATE INDEX IF NOT EXISTS idx_tournaments_server_id   ON tournaments (server_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_sync_status ON tournaments (sync_status);
CREATE INDEX IF NOT EXISTS idx_tournaments_organizer   ON tournaments (organizer_id);
```

---

## 4. Sync Queue Table

> Follows GLOBAL.md §13 exactly.

```sql
CREATE TABLE IF NOT EXISTS mutation_queue (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid              TEXT    NOT NULL UNIQUE,   -- matches the entity's uuid
  table_name        TEXT    NOT NULL,          -- 'matches' | 'users' | 'tournaments'
  operation         TEXT    NOT NULL,          -- 'INSERT' | 'UPDATE' | 'DELETE'
  payload           TEXT    NOT NULL,          -- JSON.stringify(entity data)
  retry_count       INTEGER NOT NULL DEFAULT 0,
  last_attempted_at TEXT,                      -- ISO 8601 | NULL if never attempted
  created_at        TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mq_table_name  ON mutation_queue (table_name);
CREATE INDEX IF NOT EXISTS idx_mq_retry_count ON mutation_queue (retry_count);
CREATE INDEX IF NOT EXISTS idx_mq_created_at  ON mutation_queue (created_at ASC);
```

---

## 5. Relationships & Data Flow

```
users ──────────────────────────────────────────────────┐
  │                                                      │
  │ ownerId                                              │ organizerId
  ▼                                                      ▼
matches ←──── tournaments
  │               │
  │ events[]      │ matches[] (UUIDs referencing matches)
  │               │
  ▼               ▼
MatchEvent[]   match UUIDs → matches collection


Data ownership:
- A match belongs to one owner (ownerId = Firebase Auth UID)
- A tournament belongs to one organizer (organizerId = Firebase Auth UID)
- Players in a match are referenced by UUID — full profile fetched separately
- Events are embedded in the match document (not a subcollection) for atomic writes
```

---

## 6. Firestore Security Rules

> Authoritative rules — deploy from `firestore.rules` at project root.
> Mirror kept here for reference and session context.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users — own profile only
    match /users/{userId} {
      allow read:   if request.auth != null;
      allow write:  if request.auth.uid == userId;
    }

    // Matches — authenticated read, owner write
    match /matches/{matchId} {
      allow read:   if request.auth != null
                    && (resource.data.isPublic == true
                        || request.auth.uid == resource.data.ownerId);
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.ownerId;
      allow delete: if request.auth.uid == resource.data.ownerId;

      // Spectators subcollection
      match /spectators/{userId} {
        allow read:   if request.auth != null;
        allow write:  if request.auth.uid == userId;
      }
    }

    // Tournaments — authenticated read, organizer write
    match /tournaments/{tournamentId} {
      allow read:   if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.organizerId;
      allow delete: if request.auth.uid == resource.data.organizerId;
    }
  }
}
```

---

## 7. Index Strategy

### Firestore Composite Indexes (create in Firebase Console or `firestore.indexes.json`)

| Collection    | Fields                             | Query use case                           |
| ------------- | ---------------------------------- | ---------------------------------------- |
| `matches`     | `ownerId ASC`, `created_at DESC`   | User's match history, sorted by date     |
| `matches`     | `isPublic ASC`, `status ASC`       | Public active matches (spectator browse) |
| `matches`     | `tournamentMode ASC`, `status ASC` | Active tournament matches                |
| `tournaments` | `organizerId ASC`, `status ASC`    | Organizer's tournaments                  |
| `tournaments` | `isPublic ASC`, `status ASC`       | Public active tournaments                |

### SQLite Indexes

Already defined inline in each `CREATE TABLE` block above. Summary:

| Table            | Indexed Columns                                                             |
| ---------------- | --------------------------------------------------------------------------- |
| `users`          | `uuid`, `server_id`                                                         |
| `matches`        | `uuid`, `server_id`, `sync_status`, `owner_id`, `status`, `created_at DESC` |
| `tournaments`    | `uuid`, `server_id`, `sync_status`, `organizer_id`                          |
| `mutation_queue` | `table_name`, `retry_count`, `created_at ASC`                               |

---

## 8. Schema Changelog

| Version | Date     | Change                           | Author    |
| ------- | -------- | -------------------------------- | --------- |
| 1.0.0   | May 2026 | Initial schema — all core tables | DULA team |

> Add a row here every time a field, table, index, or Firestore rule changes.

---

_Last updated: May 2026 · DULA dev team_
_Always update this file before changing any table or collection in code._
