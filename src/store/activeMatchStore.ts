import { create } from "zustand";

// Shape returned by scoringEngine after every action
export interface MatchSnapshot {
  score: Record<string, number>;
  servingTeamId: string;
  servingPlayerId: string;
  serverNumber: 1 | 2;
  timeoutsUsed: Record<string, number>;
}

interface ActiveMatchState {
  // State
  matchId: string | null;
  score: Record<string, number>;
  servingTeamId: string | null;
  servingPlayerId: string | null;
  serverNumber: 1 | 2;
  timerSeconds: number;
  isRunning: boolean;
  timeoutsUsed: Record<string, number>;
// ... rest of file (using replace to only change the relevant part)

  // Actions
  setMatch: (matchId: string, snapshot: MatchSnapshot) => void;
  applyEvent: (snapshot: MatchSnapshot) => void; // called after every scoringEngine action
  tick: () => void;                              // called by timer interval — +1 second
  setRunning: (isRunning: boolean) => void;
  clearMatch: () => void;                        // called on match end or navigate away
}

const INITIAL_STATE = {
  matchId: null,
  score: {},
  servingTeamId: null,
  servingPlayerId: null,
  serverNumber: 1 as 1 | 2,
  timerSeconds: 0,
  isRunning: false,
  timeoutsUsed: {},
};

export const useActiveMatchStore = create<ActiveMatchState>((set) => ({
  ...INITIAL_STATE,

  setMatch: (matchId, snapshot) =>
    set({
      matchId,
      score: snapshot.score,
      servingTeamId: snapshot.servingTeamId,
      servingPlayerId: snapshot.servingPlayerId,
      serverNumber: snapshot.serverNumber,
      timeoutsUsed: snapshot.timeoutsUsed,
      timerSeconds: 0,
      isRunning: false,
    }),

  // Single atomic update — scoringEngine returns full new state, store applies it all at once
  applyEvent: (snapshot) =>
    set({
      score: snapshot.score,
      servingTeamId: snapshot.servingTeamId,
      servingPlayerId: snapshot.servingPlayerId,
      serverNumber: snapshot.serverNumber,
      timeoutsUsed: snapshot.timeoutsUsed,
    }),

  tick: () =>
    set((state) => ({ timerSeconds: state.timerSeconds + 1 })),

  setRunning: (isRunning) => set({ isRunning }),

  clearMatch: () => set(INITIAL_STATE),
}));