import { create } from "zustand";

// Shape returned by scoringEngine after every action
export interface MatchSnapshot {
  score: Record<string, number>;
  servingTeamId: string;
  servingPlayerId: string;
  serverNumber: number;
  isFirstServer: boolean;
  timeoutsUsed: Record<string, number>;
}

interface ActiveMatchState {
  // State
  matchId: string | null;
  score: Record<string, number>;
  servingTeamId: string | null;
  servingPlayerId: string | null;
  serverNumber: number;
  isFirstServer: boolean;
  timerSeconds: number;
  isRunning: boolean;
  timeoutsUsed: Record<string, number>;

  // Actions
  setMatch: (matchId: string, snapshot: MatchSnapshot) => void;
  applyEvent: (snapshot: MatchSnapshot) => void;
  tick: () => void;
  setRunning: (isRunning: boolean) => void;
  clearMatch: () => void;
}

const INITIAL_STATE = {
  matchId: null,
  score: {},
  servingTeamId: null,
  servingPlayerId: null,
  serverNumber: 1,
  isFirstServer: false,
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
      isFirstServer: snapshot.isFirstServer,
      timeoutsUsed: snapshot.timeoutsUsed,
      timerSeconds: 0,
      isRunning: false,
    }),

  applyEvent: (snapshot) =>
    set({
      score: snapshot.score,
      servingTeamId: snapshot.servingTeamId,
      servingPlayerId: snapshot.servingPlayerId,
      serverNumber: snapshot.serverNumber,
      isFirstServer: snapshot.isFirstServer,
      timeoutsUsed: snapshot.timeoutsUsed,
    }),

  tick: () =>
    set((state) => ({ timerSeconds: state.timerSeconds + 1 })),

  setRunning: (isRunning) => set({ isRunning }),

  clearMatch: () => set(INITIAL_STATE),
}));