import * as Crypto from "expo-crypto";
import type { Match, Team } from "@/types/match.types";
import type { MatchEvent } from "@/types/event.types";
import type { MatchSnapshot } from "@/store/activeMatchStore";
import { MAX_TIMEOUTS_PER_TEAM } from "@/constants/scoring";

/**
 * scoringEngine.ts
 *
 * Pure functions for pickleball scoring logic.
 * No side effects — same input always produces same output.
 * All functions operate on MatchSnapshot directly — never replay event log.
 * calculateSnapshot is reserved for undo and rehydration only.
 */

// ─── Initial State ────────────────────────────────────────────────────────────

export function getInitialMatchState(match: Match): MatchSnapshot {
  const servingTeam = match.teams[0];
  const servingPlayerId = servingTeam.playerIds[0];

  const score: Record<string, number> = {};
  const timeoutsUsed: Record<string, number> = {};

  match.teams.forEach((team) => {
    score[team.id] = 0;
    timeoutsUsed[team.id] = 0;
  });

  return {
    score,
    servingTeamId: servingTeam.id,
    servingPlayerId,
    serverNumber: match.type === "doubles" ? 2 : 1, // doubles: first team gets one fault only
    isFirstServer: match.type === "doubles",         // first team gets one fault rule
    timeoutsUsed,
  };
}

// ─── Rehydration (undo + restore only) ───────────────────────────────────────

export function calculateSnapshot(match: Match): MatchSnapshot {
  const initial = getInitialMatchState(match);
  return match.events.reduce((state, event) => {
    switch (event.type) {
      case "POINT":
        return applyPoint(state, event.teamId, match);
      case "FAULT":
        return applyFault(state, event.playerId, match);
      case "TIMEOUT":
        return applyTimeout(state, event.teamId);
      case "SIDE_SWITCH":
      case "UNDO":
        return state;
      default:
        return state;
    }
  }, initial);
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function applyPoint(
  state: MatchSnapshot,
  teamId: string,
  match: Match
): MatchSnapshot {
  const newScore = { ...state.score };
  const isServingTeam = state.servingTeamId === teamId;

  if (match.rallyScoring || isServingTeam) {
    newScore[teamId] = (newScore[teamId] ?? 0) + 1;
  }

  if (isServingTeam) {
    // Serving team wins — keep serving, score updates
    return { ...state, score: newScore };
  } else {
    // Receiving team wins rally
    if (match.rallyScoring) {
      // Rally scoring: point + side-out
      newScore[teamId] = (newScore[teamId] ?? 0) + 1;
      return sideOut(state, match, newScore);
    } else {
      // Standard scoring: side-out, no point for receiving team
      return sideOut(state, match, state.score);
    }
  }
}

function applyFault(
  state: MatchSnapshot,
  playerId: string,
  match: Match
): MatchSnapshot {
  const isServingPlayer = state.servingPlayerId === playerId;

  if (isServingPlayer) {
    if (match.type === "doubles") {
      // First server of the match gets only one fault (first-game rule)
      if (state.isFirstServer) {
        return sideOut({ ...state, isFirstServer: false }, match, state.score);
      }
      if (state.serverNumber === 1) {
        // Switch to second server on same team
        const team = match.teams.find((t) => t.id === state.servingTeamId)!;
        const otherPlayerId = team.playerIds.find((id) => id !== playerId)!;
        return {
          ...state,
          serverNumber: 2,
          servingPlayerId: otherPlayerId,
          isFirstServer: false,
        };
      } else {
        // Both servers used — side-out
        return sideOut(state, match, state.score);
      }
    } else {
      // Singles — fault = side-out
      return sideOut(state, match, state.score);
    }
  }

  // Receiving player faults — serving team gets a point
  const receivingTeam = match.teams.find((t) => t.id !== state.servingTeamId)!;
  if (receivingTeam.playerIds.includes(playerId)) {
    return applyPoint(state, state.servingTeamId, match);
  }

  return state;
}

function sideOut(
  state: MatchSnapshot,
  match: Match,
  score: Record<string, number>
): MatchSnapshot {
  const nextTeam = match.teams.find((t) => t.id !== state.servingTeamId)!;
  const nextTeamScore = score[nextTeam.id] ?? 0;

  // Doubles: player in right court serves first
  // Even score = player[0] is in right court
  const nextPlayerId =
    match.type === "doubles"
      ? nextTeamScore % 2 === 0
        ? nextTeam.playerIds[0]
        : nextTeam.playerIds[1]
      : nextTeam.playerIds[0];

  return {
    ...state,
    score,
    servingTeamId: nextTeam.id,
    servingPlayerId: nextPlayerId,
    serverNumber: 1,
    isFirstServer: false,
  };
}

function applyTimeout(state: MatchSnapshot, teamId: string): MatchSnapshot {
  const timeouts = { ...state.timeoutsUsed };
  if ((timeouts[teamId] ?? 0) < MAX_TIMEOUTS_PER_TEAM) {
    timeouts[teamId] = (timeouts[teamId] ?? 0) + 1;
  }
  return { ...state, timeoutsUsed: timeouts };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function addPoint(
  snapshot: MatchSnapshot,
  teamId: string,
  match: Match
): { snapshot: MatchSnapshot; event: MatchEvent } {
  return {
    snapshot: applyPoint(snapshot, teamId, match),
    event: {
      type: "POINT",
      teamId,
      timestamp: Date.now(),
      eventId: Crypto.randomUUID(),
    },
  };
}

export function addFault(
  snapshot: MatchSnapshot,
  playerId: string,
  match: Match
): { snapshot: MatchSnapshot; event: MatchEvent } {
  return {
    snapshot: applyFault(snapshot, playerId, match),
    event: {
      type: "FAULT",
      playerId,
      timestamp: Date.now(),
      eventId: Crypto.randomUUID(),
    },
  };
}

export function callTimeout(
  snapshot: MatchSnapshot,
  teamId: string
): { snapshot: MatchSnapshot; event: MatchEvent } {
  return {
    snapshot: applyTimeout(snapshot, teamId),
    event: {
      type: "TIMEOUT",
      teamId,
      timestamp: Date.now(),
      eventId: Crypto.randomUUID(),
    },
  };
}

export function undo(
  match: Match
): { snapshot: MatchSnapshot } {
  // Truncate last event and rehydrate — no UNDO event stored
  const truncated = match.events.slice(0, -1);
  return {
    snapshot: calculateSnapshot({ ...match, events: truncated }),
  };
}

export function checkWinCondition(
  snapshot: MatchSnapshot,
  match: Match
): Team | null {
  for (const team of match.teams) {
    const teamScore = snapshot.score[team.id] ?? 0;
    const otherTeam = match.teams.find((t) => t.id !== team.id)!;
    const otherScore = snapshot.score[otherTeam.id] ?? 0;

    if (teamScore >= match.scoreLimit) {
      if (!match.winByTwo || teamScore - otherScore >= 2) {
        return team;
      }
    }
  }
  return null;
}