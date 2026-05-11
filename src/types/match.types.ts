import type { BaseEntity } from "./base.types";
import type { MatchEvent } from "./event.types";

export type MatchType = "singles" | "doubles";
export type MatchStatus = "setup" | "active" | "completed";
export type ScoreLimit = 11 | 15 | 21;

export interface Team {
  id: string;
  name: string;
  playerIds: string[];
  color?: string | null;
}

export interface Match extends BaseEntity {
  ownerId: string;
  type: MatchType;
  status: MatchStatus;
  scoreLimit: ScoreLimit;
  winByTwo: boolean;
  rallyScoring: boolean;
  tournamentMode: boolean;
  isPublic: boolean;
  teams: Team[];
  events: MatchEvent[];
  score: Record<string, number>;
  servingTeamId: string | null;   // null during 'setup' — assigned when match starts
  servingPlayerId: string | null; // null during 'setup' — assigned when match starts
  serverNumber: 1 | 2;            // 1 or 2 (in doubles)
  startedAt?: string | null;      // ISO 8601
  completedAt?: string | null;    // ISO 8601
  durationSeconds?: number | null;
}