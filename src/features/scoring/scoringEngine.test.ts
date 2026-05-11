import type { Match } from "@/types/match.types";
import type { MatchSnapshot } from "@/store/activeMatchStore";
import {
  getInitialMatchState,
  addPoint,
  addFault,
  callTimeout,
  undo,
  checkWinCondition,
} from "./scoringEngine";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const createBaseMatch = (type: "singles" | "doubles" = "doubles"): Match => ({
  id: 0,
  uuid: "test-match",
  server_id: null,
  sync_status: "pending",
  sync_error: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ownerId: "owner-1",
  type,
  status: "active",
  scoreLimit: 11,
  winByTwo: true,
  rallyScoring: false,
  tournamentMode: false,
  isPublic: false,
  teams:
    type === "doubles"
      ? [
          { id: "team1", name: "Team 1", playerIds: ["p1", "p2"] },
          { id: "team2", name: "Team 2", playerIds: ["p3", "p4"] },
        ]
      : [
          { id: "team1", name: "Player 1", playerIds: ["p1"] },
          { id: "team2", name: "Player 2", playerIds: ["p3"] },
        ],
  events: [],
  score: { team1: 0, team2: 0 },
  serverNumber: 1,
  servingTeamId: "team1",
  servingPlayerId: "p1",
  durationSeconds: null,
  startedAt: null,
  completedAt: null,
});

const makeSnapshot = (overrides: Partial<MatchSnapshot> = {}): MatchSnapshot => ({
  score: { team1: 0, team2: 0 },
  servingTeamId: "team1",
  servingPlayerId: "p1",
  serverNumber: 1,
  isFirstServer: false,
  timeoutsUsed: { team1: 0, team2: 0 },
  ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("scoringEngine", () => {

  describe("getInitialMatchState", () => {
    it("doubles — starts with serverNumber 2 and isFirstServer true", () => {
      const match = createBaseMatch("doubles");
      const state = getInitialMatchState(match);
      expect(state.serverNumber).toBe(2);
      expect(state.isFirstServer).toBe(true);
      expect(state.servingTeamId).toBe("team1");
      expect(state.score.team1).toBe(0);
      expect(state.score.team2).toBe(0);
    });

    it("singles — starts with serverNumber 1 and isFirstServer false", () => {
      const match = createBaseMatch("singles");
      const state = getInitialMatchState(match);
      expect(state.serverNumber).toBe(1);
      expect(state.isFirstServer).toBe(false);
    });
  });

  describe("Doubles — serve rotation", () => {
    it("first server fault at start of game triggers immediate side-out (one-fault rule)", () => {
      const match = createBaseMatch("doubles");
      const s0 = getInitialMatchState(match);

      const { snapshot: s1 } = addFault(s0, "p1", match);

      expect(s1.servingTeamId).toBe("team2");
      expect(s1.serverNumber).toBe(1);
      expect(s1.servingPlayerId).toBe("p3"); // score 0 = even = playerIds[0]
      expect(s1.isFirstServer).toBe(false);
    });

    it("first server fault (non-start) moves to second server", () => {
      const match = createBaseMatch("doubles");
      const s0 = getInitialMatchState(match);

      // Side-out to team2 first (clears isFirstServer)
      const { snapshot: s1 } = addFault(s0, "p1", match);
      // team2 server 1 faults — should move to server 2
      const { snapshot: s2 } = addFault(s1, "p3", match);

      expect(s2.servingTeamId).toBe("team2");
      expect(s2.serverNumber).toBe(2);
      expect(s2.servingPlayerId).toBe("p4");
    });

    it("second server fault triggers side-out", () => {
      const match = createBaseMatch("doubles");
      const s0 = getInitialMatchState(match);

      const { snapshot: s1 } = addFault(s0, "p1", match); // side-out → team2 s1
      const { snapshot: s2 } = addFault(s1, "p3", match); // → team2 s2
      const { snapshot: s3 } = addFault(s2, "p4", match); // side-out → team1 s1

      expect(s3.servingTeamId).toBe("team1");
      expect(s3.serverNumber).toBe(1);
    });

    it("serving team scores — keeps serving, score increases", () => {
      const match = createBaseMatch("doubles");
      const s0 = getInitialMatchState(match);

      const { snapshot: s1 } = addPoint(s0, "team1", match);

      expect(s1.score.team1).toBe(1);
      expect(s1.servingTeamId).toBe("team1");
      expect(s1.servingPlayerId).toBe("p1");
      expect(s1.serverNumber).toBe(2);
    });
  });

  describe("Singles — serve rotation", () => {
    it("fault triggers side-out", () => {
      const match = createBaseMatch("singles");
      const s0 = getInitialMatchState(match);

      const { snapshot: s1 } = addFault(s0, "p1", match);

      expect(s1.servingTeamId).toBe("team2");
      expect(s1.servingPlayerId).toBe("p3");
    });

    it("point keeps same server", () => {
      const match = createBaseMatch("singles");
      const s0 = getInitialMatchState(match);

      const { snapshot: s1 } = addPoint(s0, "team1", match);

      expect(s1.servingTeamId).toBe("team1");
      expect(s1.servingPlayerId).toBe("p1");
      expect(s1.score.team1).toBe(1);
    });
  });

  describe("Timeout", () => {
    it("deducts a timeout from the team", () => {
      const match = createBaseMatch("doubles");
      const s0 = getInitialMatchState(match);

      const { snapshot: s1 } = callTimeout(s0, "team1");

      expect(s1.timeoutsUsed.team1).toBe(1);
    });

    it("does not exceed max timeouts", () => {
      const match = createBaseMatch("doubles");
      const s0 = getInitialMatchState(match);

      const { snapshot: s1 } = callTimeout(s0, "team1");
      const { snapshot: s2 } = callTimeout(s1, "team1");
      const { snapshot: s3 } = callTimeout(s2, "team1"); // should be capped

      expect(s3.timeoutsUsed.team1).toBe(2); // MAX_TIMEOUTS_PER_TEAM = 2
    });
  });

  describe("Win condition", () => {
    it("detects win at score limit without win-by-two", () => {
      const match = createBaseMatch("singles");
      match.winByTwo = false;

      const snapshot = makeSnapshot({ score: { team1: 11, team2: 5 } });
      const winner = checkWinCondition(snapshot, match);

      expect(winner?.id).toBe("team1");
    });

    it("no win below score limit", () => {
      const match = createBaseMatch("singles");
      const snapshot = makeSnapshot({ score: { team1: 10, team2: 5 } });

      expect(checkWinCondition(snapshot, match)).toBeNull();
    });

    it("win-by-two — no win when tied at limit", () => {
      const match = createBaseMatch("singles");
      match.winByTwo = true;

      const snapshot = makeSnapshot({ score: { team1: 11, team2: 10 } });
      expect(checkWinCondition(snapshot, match)).toBeNull();
    });

    it("win-by-two — win when 2 ahead", () => {
      const match = createBaseMatch("singles");
      match.winByTwo = true;

      const snapshot = makeSnapshot({ score: { team1: 12, team2: 10 } });
      expect(checkWinCondition(snapshot, match)?.id).toBe("team1");
    });
  });

  describe("Undo", () => {
    it("restores state before last event", () => {
      const match = createBaseMatch("doubles");
      const s0 = getInitialMatchState(match);

      // Build up two events
      const { snapshot: s1, event: e1 } = addPoint(s0, "team1", match);
const { event: e2 } = addFault(s1, "p1", match);

      // Attach events to match (immutably)
      const matchWithEvents = { ...match, events: [e1, e2] };

      // Undo — should restore state after e1 only
      const { snapshot: sUndo } = undo(matchWithEvents);

      expect(sUndo.score.team1).toBe(1);       // point scored in e1 still there
      expect(sUndo.servingTeamId).toBe("team1"); // fault in e2 undone
    });

    it("undo on empty events returns initial state", () => {
      const match = createBaseMatch("doubles");
      const { snapshot } = undo(match);

      expect(snapshot.score.team1).toBe(0);
      expect(snapshot.servingTeamId).toBe("team1");
    });
  });
});