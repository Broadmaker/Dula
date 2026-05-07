import type { BaseEntity } from "./base.types";

export type TournamentFormat =
  | "single_elim"
  | "double_elim"
  | "round_robin"
  | "ladder";
export type TournamentStatus = "draft" | "active" | "completed";

export interface Standing {
  playerId: string;
  wins: number;
  losses: number;
  pointDiff: number;
}

export interface Court {
  id: string;
  name: string;
  matchId?: string | null;
}

export interface Tournament extends BaseEntity {
  name: string;
  organizerId: string;
  format: TournamentFormat;
  status: TournamentStatus;
  isPublic: boolean;
  players: string[];
  matches: string[];
  standings: Standing[];
  courts: Court[];
  startDate: string; // ISO 8601
}
