import type { SQLiteDatabase } from "expo-sqlite";
import type { Match, Team } from "@/types/match.types";
import type { MatchEvent } from "@/types/event.types";
import { logger } from "@/utils/logger";

export const DATABASE_NAME = "dula.db";

export const initDatabase = async (db: SQLiteDatabase) => {
  try {
    // Enable WAL mode for performance
    await db.execAsync("PRAGMA journal_mode = WAL;");

    // Matches table
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

    // Indexes
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

export const matchDb = (db: SQLiteDatabase) => ({
  async insertMatch(match: Match) {
    const query = `
      INSERT INTO matches (
        uuid, owner_id, type, status, score_limit, win_by_two, 
        rally_scoring, tournament_mode, is_public, teams_json, 
        events_json, score_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    return db.runAsync(
      query,
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
      match.created_at,
      match.updated_at
    );
  },

  async updateMatch(match: Match) {
    const query = `
      UPDATE matches SET
        status = ?,
        teams_json = ?,
        events_json = ?,
        score_json = ?,
        serving_team_id = ?,
        serving_player_id = ?,
        started_at = ?,
        completed_at = ?,
        duration_seconds = ?,
        sync_status = ?,
        updated_at = ?
      WHERE uuid = ?;
    `;
    return db.runAsync(
      query,
      match.status,
      JSON.stringify(match.teams),
      JSON.stringify(match.events),
      JSON.stringify(match.score),
      match.servingTeamId,
      match.servingPlayerId,
      match.startedAt,
      match.completedAt,
      match.durationSeconds,
      match.sync_status,
      match.updated_at,
      match.uuid
    );
  },

  async getMatchByUuid(uuid: string): Promise<Match | null> {
    const row = await db.getFirstAsync<any>("SELECT * FROM matches WHERE uuid = ?;", uuid);
    if (!row) return null;

    return {
      ...row,
      winByTwo: !!row.win_by_two,
      rallyScoring: !!row.rally_scoring,
      tournamentMode: !!row.tournament_mode,
      isPublic: !!row.is_public,
      teams: JSON.parse(row.teams_json),
      events: JSON.parse(row.events_json),
      score: JSON.parse(row.score_json),
      ownerId: row.owner_id,
      scoreLimit: row.score_limit,
      servingTeamId: row.serving_team_id,
      servingPlayerId: row.serving_player_id,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      durationSeconds: row.duration_seconds,
    };
  },

  async getAllMatches(): Promise<Match[]> {
    const rows = await db.getAllAsync<any>("SELECT * FROM matches ORDER BY created_at DESC;");
    return rows.map((row) => ({
      ...row,
      winByTwo: !!row.win_by_two,
      rallyScoring: !!row.rally_scoring,
      tournamentMode: !!row.tournament_mode,
      isPublic: !!row.is_public,
      teams: JSON.parse(row.teams_json),
      events: JSON.parse(row.events_json),
      score: JSON.parse(row.score_json),
      ownerId: row.owner_id,
      scoreLimit: row.score_limit,
      servingTeamId: row.serving_team_id,
      servingPlayerId: row.serving_player_id,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      durationSeconds: row.duration_seconds,
    }));
  },

  async getRecentMatches(limit: number = 5): Promise<Match[]> {
    const rows = await db.getAllAsync<any>(
      "SELECT * FROM matches ORDER BY created_at DESC LIMIT ?;",
      limit
    );
    return rows.map((row) => ({
      ...row,
      winByTwo: !!row.win_by_two,
      rallyScoring: !!row.rally_scoring,
      tournamentMode: !!row.tournament_mode,
      isPublic: !!row.is_public,
      teams: JSON.parse(row.teams_json),
      events: JSON.parse(row.events_json),
      score: JSON.parse(row.score_json),
      ownerId: row.owner_id,
      scoreLimit: row.score_limit,
      servingTeamId: row.serving_team_id,
      servingPlayerId: row.serving_player_id,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      durationSeconds: row.duration_seconds,
    }));
  },
});
