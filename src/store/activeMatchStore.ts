import { create } from "zustand";
import type { MatchSnapshot } from "@/types/match.types"; // We might need to define this or use Match

interface ActiveMatchState {
  matchId: string | null;
  score: Record<string, number>;
  servingTeamId: string | null;
  servingPlayerId: string | null;
  timerSeconds: number;
  isRunning: boolean;
  timeoutsUsed: Record<string, number>;

  // Actions
  setMatch: (matchId: string, initialScore: Record<string, number>) => void;
  updateScore: (score: Record<string, number>) => void;
  setServingTeam: (teamId: string | null) => void;
  setServingPlayer: (playerId: string | null) => void;
  incrementTimer: () => void;
  setRunning: (isRunning: boolean) => void;
  updateTimeouts: (timeouts: Record<string, number>) => void;
  reset: () => void;
}

export const useActiveMatchStore = create<ActiveMatchState>((set) => ({
  matchId: null,
  score: {},
  servingTeamId: null,
  servingPlayerId: null,
  timerSeconds: 0,
  isRunning: false,
  timeoutsUsed: {},

  setMatch: (matchId, initialScore) =>
    set({
      matchId,
      score: initialScore,
      timerSeconds: 0,
      isRunning: false,
      timeoutsUsed: {},
    }),

  updateScore: (score) => set({ score }),

  setServingTeam: (servingTeamId) => set({ servingTeamId }),

  setServingPlayer: (servingPlayerId) => set({ servingPlayerId }),

  incrementTimer: () =>
    set((state) => ({ timerSeconds: state.timerSeconds + 1 })),

  setRunning: (isRunning) => set({ isRunning }),

  updateTimeouts: (timeoutsUsed) => set({ timeoutsUsed }),

  reset: () =>
    set({
      matchId: null,
      score: {},
      servingTeamId: null,
      servingPlayerId: null,
      timerSeconds: 0,
      isRunning: false,
      timeoutsUsed: {},
    }),
}));
