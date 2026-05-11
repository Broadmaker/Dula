import { Match, Team } from "@/types/match.types";
import { MatchEvent } from "@/types/event.types";
import { MatchSnapshot } from "@/store/activeMatchStore";
import { MAX_TIMEOUTS_PER_TEAM } from "@/constants/scoring";

/**
 * scoringEngine.ts
 * 
 * Pure functions for Pickleball scoring logic.
 * Handles points, faults, serve rotation, and win conditions.
 */

export function getInitialMatchState(match: Match): MatchSnapshot {
  const servingTeam = match.teams[0]; // Team 1 starts serving by default
  const servingPlayerId = servingTeam.playerIds[0];

  const score: Record<string, number> = {};
  const timeoutsUsed: Record<string, number> = {};
  
  match.teams.forEach(team => {
    score[team.id] = 0;
    timeoutsUsed[team.id] = 0;
  });

  return {
    score,
    servingTeamId: servingTeam.id,
    servingPlayerId: servingPlayerId,
    serverNumber: match.type === "doubles" ? 2 : 1, // Start at 2 for first team in doubles
    timeoutsUsed,
  };
}

export function calculateSnapshot(match: Match): MatchSnapshot {
  // Derive current state from the full event log
  // This is useful for UNDO or re-hydrating state
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
        return state; // Side switch doesn't affect scoring state
      case "UNDO":
        // UNDO is handled by re-calculating from a truncated event list, 
        // so we shouldn't see it here if we use reduce correctly.
        return state;
      default:
        return state;
    }
  }, initial);
}

function applyPoint(state: MatchSnapshot, teamId: string, match: Match): MatchSnapshot {
  const newScore = { ...state.score };
  
  // In rally scoring, every rally wins a point.
  // In standard scoring, only the serving team wins a point.
  const isServingTeam = state.servingTeamId === teamId;
  
  if (match.rallyScoring || isServingTeam) {
    newScore[teamId] = (newScore[teamId] || 0) + 1;
  }

  if (isServingTeam) {
    // Serving team wins rally: they keep serving and switch sides (doubles)
    if (match.type === "doubles") {
      const team = match.teams.find(t => t.id === teamId)!;
      // In doubles, server switches between player 0 and 1 positionally?
      // No, the SAME server continues but switches which side of court they are on.
      // We need to know which player is serving.
      const currentPlayerIdx = team.playerIds.indexOf(state.servingPlayerId);
      // We don't necessarily change servingPlayerId, but we change their "side".
      // Since we don't track side explicitly in the snapshot, we rely on score even/odd.
      return {
        ...state,
        score: newScore,
      };
    } else {
      // Singles: server switches side based on score
      return {
        ...state,
        score: newScore,
        servingPlayerId: state.servingPlayerId, // stays same server
      };
    }
  } else {
    // Receiving team wins rally
    if (match.rallyScoring) {
      // In rally scoring, winning receiving rally usually means side-out too?
      // Standard rally scoring: point + side-out.
      return sideOut(state, match, newScore);
    } else {
      // Standard scoring: Side-out or second server
      return applyFault(state, state.servingPlayerId, match);
    }
  }
}

function applyFault(state: MatchSnapshot, playerId: string, match: Match): MatchSnapshot {
  // If serving team faults:
  if (state.servingPlayerId === playerId) {
    if (match.type === "doubles") {
      if (state.serverNumber === 1) {
        // Switch to second server
        const team = match.teams.find(t => t.id === state.servingTeamId)!;
        const otherPlayerId = team.playerIds.find(id => id !== playerId)!;
        return {
          ...state,
          serverNumber: 2,
          servingPlayerId: otherPlayerId,
        };
      } else {
        // Side-out
        return sideOut(state, match);
      }
    } else {
      // Singles side-out
      return sideOut(state, match);
    }
  }
  
  // If receiving team faults, serving team gets a point
  const receivingTeam = match.teams.find(t => t.id !== state.servingTeamId)!;
  if (receivingTeam.playerIds.includes(playerId)) {
    return applyPoint(state, state.servingTeamId, match);
  }

  return state;
}

function sideOut(state: MatchSnapshot, match: Match, updatedScore?: Record<string, number>): MatchSnapshot {
  const nextTeam = match.teams.find(t => t.id !== state.servingTeamId)!;
  const score = updatedScore || state.score;
  const nextTeamScore = score[nextTeam.id] || 0;
  
  let nextPlayerId: string;
  if (match.type === "doubles") {
    // In doubles side-out, the player who is in the right-hand court serves first.
    // The player whose "natural" side (based on starting right) matches the even/odd of their score?
    // Actually, rule is: if score is even, the player who started on the right is on the right.
    // So if score is even, the "even" player serves first.
    // We assume team.playerIds[0] is the "even" player.
    nextPlayerId = (nextTeamScore % 2 === 0) ? nextTeam.playerIds[0] : nextTeam.playerIds[1];
  } else {
    nextPlayerId = nextTeam.playerIds[0];
  }

  return {
    ...state,
    score,
    servingTeamId: nextTeam.id,
    servingPlayerId: nextPlayerId,
    serverNumber: 1,
  };
}

function applyTimeout(state: MatchSnapshot, teamId: string): MatchSnapshot {
  const timeouts = { ...state.timeoutsUsed };
  if ((timeouts[teamId] || 0) < MAX_TIMEOUTS_PER_TEAM) {
    timeouts[teamId] = (timeouts[teamId] || 0) + 1;
  }
  return { ...state, timeoutsUsed: timeouts };
}

export function addPoint(match: Match, teamId: string): { snapshot: MatchSnapshot; event: MatchEvent } {
  const currentSnapshot = calculateSnapshot(match);
  const nextSnapshot = applyPoint(currentSnapshot, teamId, match);
  
  const event: MatchEvent = {
    type: "POINT",
    teamId,
    timestamp: Date.now(),
    eventId: Math.random().toString(36).substring(7), // Should ideally use Crypto.randomUUID()
  };
  
  return { snapshot: nextSnapshot, event };
}

export function addFault(match: Match, playerId: string): { snapshot: MatchSnapshot; event: MatchEvent } {
  const currentSnapshot = calculateSnapshot(match);
  const nextSnapshot = applyFault(currentSnapshot, playerId, match);
  
  const event: MatchEvent = {
    type: "FAULT",
    playerId,
    timestamp: Date.now(),
    eventId: Math.random().toString(36).substring(7),
  };
  
  return { snapshot: nextSnapshot, event };
}

export function callTimeout(match: Match, teamId: string): { snapshot: MatchSnapshot; event: MatchEvent } {
  const currentSnapshot = calculateSnapshot(match);
  const nextSnapshot = applyTimeout(currentSnapshot, teamId);
  
  const event: MatchEvent = {
    type: "TIMEOUT",
    teamId,
    timestamp: Date.now(),
    eventId: Math.random().toString(36).substring(7),
  };
  
  return { snapshot: nextSnapshot, event };
}

export function undo(match: Match): { snapshot: MatchSnapshot; event: MatchEvent | null } {
  if (match.events.length === 0) return { snapshot: calculateSnapshot(match), event: null };
  
  // We don't actually ADD an UNDO event to the events list in the snapshot calculation,
  // we usually just remove the last event from the list.
  // But the todo says undo(state) -> previous state.
  
  const truncatedEvents = match.events.slice(0, -1);
  const nextSnapshot = calculateSnapshot({ ...match, events: truncatedEvents });
  
  const event: MatchEvent = {
    type: "UNDO",
    timestamp: Date.now(),
    eventId: Math.random().toString(36).substring(7),
  };
  
  return { snapshot: nextSnapshot, event };
}

export function checkWinCondition(match: Match, snapshot: MatchSnapshot): Team | null {
  const score = snapshot.score;
  const limit = match.scoreLimit;
  
  for (const team of match.teams) {
    const teamScore = score[team.id] || 0;
    const otherTeam = match.teams.find(t => t.id !== team.id)!;
    const otherScore = score[otherTeam.id] || 0;
    
    if (teamScore >= limit) {
      if (!match.winByTwo || (teamScore - otherScore >= 2)) {
        return team;
      }
    }
  }
  
  return null;
}
