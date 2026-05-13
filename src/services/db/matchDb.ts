import type { SQLiteDatabase } from "expo-sqlite";
import type { Match, Team } from "@/types/match.types";
import type { MatchEvent } from "@/types/event.types";
import { logger } from "@/utils/logger";

export const DATABASE_NAME = "dula.db";

// ─── Raw DB row type — never use any ─────────────────────────────────────────
type MatchRow = {
  id: number;
  uuid: string;
  server_id: string | null;
  sync_status: string;
  sync_error: string | null;
  created_at: string;
  updated_at: string;
  owner_id: string;
  type: string;
  status: string;
  score_limit: number;
  win_by_two: number;       // SQLite integer — 0 | 1
  rally_scoring: number;
  tournament_mode: number;
  is_public: number;
  teams_json: string;
  events_json: string;
  score_json: string;
  serving_team_id: string | null;
  serving_player_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
};

// ─── Row → Match mapper — single source of truth ─────────────────────────────
const mapRowToMatch = (row: MatchRow): Match => ({
  id:            row.id,
  uuid:          row.uuid,
  server_id:     row.server_id,
  sync_status:   row.sync_status as Match["sync_status"],
  sync_error:    row.sync_error,
  created_at:    row.created_at,
  updated_at:    row.updated_at,
  ownerId:       row.owner_id,
  type:          row.type as Match["type"],
  status:        row.status as Match["status"],
  scoreLimit:    row.score_limit as Match["scoreLimit"],
  winByTwo:      !!row.win_by_two,
  rallyScoring:  !!row.rally_scoring,
  tournamentMode: !!row.tournament_mode,
  isPublic:      !!row.is_public,
  teams:         JSON.parse(row.teams_json) as Team[],
  events:        JSON.parse(row.events_json) as MatchEvent[],
  score:         JSON.parse(row.score_json) as Record<string, number>,
  servingTeamId:   row.serving_team_id,
  servingPlayerId: row.serving_player_id,
  startedAt:       row.started_at ?? undefined,
  completedAt:     row.completed_at ?? undefined,
  durationSeconds: row.duration_seconds ?? undefined,
});

// ─── DB init ─────────────────────────────────────────────────────────────────
export const initDatabase = async (db: SQLiteDatabase) => {
  try {
    await db.execAsync("PRAGMA journal_mode = WAL;");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS matches (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid            TEXT    NOT NULL UNIQUE,
        server_id       TEXT,
        sync_status     TEXT    NOT NULL DEFAULT 'pending',
        sync_error      TEXT,
        created_at      TEXT    NOT NULL,
        updated_at      TEXT    NOT NULL,

        owner_id        TEXT    NOT NULL,
        type            TEXT    NOT NULL,
        status          TEXT    NOT NULL DEFAULT 'setup',
        score_limit     INTEGER NOT NULL DEFAULT 11,
        win_by_two      INTEGER NOT NULL DEFAULT 1,
        rally_scoring   INTEGER NOT NULL DEFAULT 0,
        tournament_mode INTEGER NOT NULL DEFAULT 0,
        is_public       INTEGER NOT NULL DEFAULT 0,

        teams_json      TEXT    NOT NULL,
        events_json     TEXT    NOT NULL DEFAULT '[]',
        score_json      TEXT    NOT NULL DEFAULT '{}',

        serving_team_id   TEXT,
        serving_player_id TEXT,
        started_at        TEXT,
        completed_at      TEXT,
        duration_seconds  INTEGER
      );
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_matches_uuid        ON matches (uuid);
      CREATE INDEX IF NOT EXISTS idx_matches_server_id   ON matches (server_id);
      CREATE INDEX IF NOT EXISTS idx_matches_sync_status ON matches (sync_status);
      CREATE INDEX IF NOT EXISTS idx_matches_owner_id    ON matches (owner_id);
      CREATE INDEX IF NOT EXISTS idx_matches_status      ON matches (status);
      CREATE INDEX IF NOT EXISTS idx_matches_created_at  ON matches (created_at DESC);
    `);

    logger.info("Database initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize database", error);
    throw error;
  }
};

// ─── CRUD ─────────────────────────────────────────────────────────────────────
export const matchDb = (db: SQLiteDatabase) => ({

  async insertMatch(match: Match) {
    return db.runAsync(
      `INSERT INTO matches (
        uuid, owner_id, type, status, score_limit, win_by_two,
        rally_scoring, tournament_mode, is_public, teams_json,
        events_json, score_json, sync_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      match.uuid,
      match.ownerId,
      match.type,
      match.status,
      match.scoreLimit,
      match.winByTwo ? 1 : 0,
      match.rallyScoring ? 1 : 0,
      match.tournamentMode ? 1 : 0,
      match.isPublic ? 1 : 0,
      JSON.stringify(match.teams),
      JSON.stringify(match.events),
      JSON.stringify(match.score),
      match.sync_status,
      match.created_at,
      match.updated_at
    );
  },

  async updateMatch(match: Match) {
    return db.runAsync(
      `UPDATE matches SET
        status            = ?,
        teams_json        = ?,
        events_json       = ?,
        score_json        = ?,
        serving_team_id   = ?,
        serving_player_id = ?,
        started_at        = ?,
        completed_at      = ?,
        duration_seconds  = ?,
        sync_status       = ?,
        updated_at        = ?
      WHERE uuid = ?;`,
      match.status,
      JSON.stringify(match.teams),
      JSON.stringify(match.events),
      JSON.stringify(match.score),
      match.servingTeamId ?? null,
      match.servingPlayerId ?? null,
      match.startedAt ?? null,
      match.completedAt ?? null,
      match.durationSeconds ?? null,
      match.sync_status,
      match.updated_at,
      match.uuid
    );
  },

  async deleteMatch(uuid: string) {
    return db.runAsync(
      "UPDATE matches SET sync_status = 'deleted', updated_at = ? WHERE uuid = ?;",
      new Date().toISOString(),
      uuid
    );
  },

  async getMatchByUuid(uuid: string): Promise<Match | null> {
    const row = await db.getFirstAsync<MatchRow>(
      "SELECT * FROM matches WHERE uuid = ?;",
      uuid
    );
    if (!row) return null;
    return mapRowToMatch(row);
  },

  async getAllMatches(): Promise<Match[]> {
    const rows = await db.getAllAsync<MatchRow>(
      "SELECT * FROM matches ORDER BY created_at DESC;"
    );
    return rows.map(mapRowToMatch);
  },

  async getRecentMatches(limit = 5): Promise<Match[]> {
    const rows = await db.getAllAsync<MatchRow>(
      "SELECT * FROM matches ORDER BY created_at DESC LIMIT ?;",
      limit
    );
    return rows.map(mapRowToMatch);
  },
});