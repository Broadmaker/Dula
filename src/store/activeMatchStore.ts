import { create } from "zustand";

// Shape returned by scoringEngine after every action
export interface MatchSnapshot {
  score: Record<string, number>;
  servingTeamId: string;
  servingPlayerId: string;
  timeoutsUsed: Record<string, number>;
}

interface ActiveMatchState {
  // State
  matchId: string | null;
  score: Record<string, number>;
  servingTeamId: string | null;
  servingPlayerId: string | null;
  timerSeconds: number;
  isRunning: boolean;
  timeoutsUsed: Record<string, number>;

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
      timeoutsUsed: snapshot.timeoutsUsed,
    }),

  tick: () =>
    set((state) => ({ timerSeconds: state.timerSeconds + 1 })),

  setRunning: (isRunning) => set({ isRunning }),

  clearMatch: () => set(INITIAL_STATE),
}));