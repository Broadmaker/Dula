import { Match } from "@/types/match.types";
import { 
  getInitialMatchState, 
  addPoint, 
  addFault, 
  undo, 
  checkWinCondition 
} from "./scoringEngine";

const mockTeams = [
  { id: "team1", name: "Team 1", playerIds: ["p1", "p2"] },
  { id: "team2", name: "Team 2", playerIds: ["p3", "p4"] },
];

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
  teams: type === "doubles" ? mockTeams : [
    { id: "team1", name: "Player 1", playerIds: ["p1"] },
    { id: "team2", name: "Player 2", playerIds: ["p3"] },
  ],
  events: [],
  score: { team1: 0, team2: 0 },
  servingTeamId: "team1",
  servingPlayerId: "p1",
  serverNumber: type === "doubles" ? 2 : 1,
});

describe("scoringEngine", () => {
  describe("Initial State", () => {
    it("should start doubles with server 2 for first team", () => {
      const match = createBaseMatch("doubles");
      const state = getInitialMatchState(match);
      expect(state.serverNumber).toBe(2);
      expect(state.servingTeamId).toBe("team1");
      expect(state.score.team1).toBe(0);
    });

    it("should start singles with server 1", () => {
      const match = createBaseMatch("singles");
      const state = getInitialMatchState(match);
      expect(state.serverNumber).toBe(1);
    });
  });

  describe("Doubles Serve Rotation", () => {
    it("should side-out immediately on first server fault if it's the start of the game (Server 2 rule)", () => {
      let match = createBaseMatch("doubles");
      const { snapshot } = addFault(match, "p1");
      
      expect(snapshot.servingTeamId).toBe("team2");
      expect(snapshot.serverNumber).toBe(1);
      expect(snapshot.servingPlayerId).toBe("p3"); // Right court player serves first
    });

    it("should move to second server if first server faults (non-start of game)", () => {
      let match = createBaseMatch("doubles");
      
      // 1. Initial: Team 1 (Server 2) serves
      // 2. Fault p1 -> Side-out to Team 2 (Server 1)
      const { event: e1 } = addFault(match, "p1");
      match.events.push(e1);
      
      // 3. Now Team 2 (Server 1) is serving. Fault p3.
      const { snapshot } = addFault(match, "p3");
      expect(snapshot.servingTeamId).toBe("team2");
      expect(snapshot.serverNumber).toBe(2);
      expect(snapshot.servingPlayerId).toBe("p4");
    });

    it("should side-out if second server faults", () => {
      let match = createBaseMatch("doubles");
      
      // 1. Initial: Team 1 (Server 2)
      // 2. Fault p1 -> Side-out to Team 2 (Server 1)
      const { event: e1 } = addFault(match, "p1");
      match.events.push(e1);
      
      // 3. Fault p3 -> Team 2 (Server 2)
      const { event: e2 } = addFault(match, "p3");
      match.events.push(e2);
      
      // 4. Fault p4 -> Side-out to Team 1 (Server 1)
      const { snapshot } = addFault(match, "p4");
      expect(snapshot.servingTeamId).toBe("team1");
      expect(snapshot.serverNumber).toBe(1);
    });

    it("should keep same server but increase score on point", () => {
      let match = createBaseMatch("doubles");
      const { snapshot } = addPoint(match, "team1");
      expect(snapshot.score.team1).toBe(1);
      expect(snapshot.servingTeamId).toBe("team1");
      expect(snapshot.servingPlayerId).toBe("p1");
      expect(snapshot.serverNumber).toBe(2);
    });
  });

  describe("Singles Serve Rotation", () => {
    it("should side-out on fault", () => {
      let match = createBaseMatch("singles");
      const { snapshot } = addFault(match, "p1");
      expect(snapshot.servingTeamId).toBe("team2");
    });
  });

  describe("Win Conditions", () => {
    it("should detect win at limit", () => {
      const match = createBaseMatch("singles");
      match.scoreLimit = 11;
      match.winByTwo = false;
      
      const snapshot = {
        score: { team1: 11, team2: 5 },
        servingTeamId: "team1",
        servingPlayerId: "p1",
        serverNumber: 1 as const,
        timeoutsUsed: { team1: 0, team2: 0 }
      };
      
      const winner = checkWinCondition(match, snapshot);
      expect(winner?.id).toBe("team1");
    });

    it("should require win by two if configured", () => {
      const match = createBaseMatch("singles");
      match.scoreLimit = 11;
      match.winByTwo = true;
      
      const snapshot = {
        score: { team1: 11, team2: 10 },
        servingTeamId: "team1",
        servingPlayerId: "p1",
        serverNumber: 1 as const,
        timeoutsUsed: { team1: 0, team2: 0 }
      };
      
      expect(checkWinCondition(match, snapshot)).toBeNull();
      
      snapshot.score.team1 = 12;
      expect(checkWinCondition(match, snapshot)?.id).toBe("team1");
    });
  });

  describe("Undo", () => {
    it("should restore previous state", () => {
      let match = createBaseMatch("doubles");
      
      // 1. Initial: Score 0-0, Team 1 (Server 2)
      
      // 2. Add a point
      const { event: e1 } = addPoint(match, "team1");
      match.events.push(e1);
      
      // 3. Add a fault (side-out since it's start of game)
      const { event: e2 } = addFault(match, "p1");
      match.events.push(e2);
      
      // Verify state after 2 events
      const s2 = undo(match); // This calculates for [e1, e2] then returns previous? 
      // Wait, undo in my engine returns calculateSnapshot(truncatedEvents).
      
      const { snapshot: sUndo } = undo(match);
      expect(sUndo.servingTeamId).toBe("team1");
      expect(sUndo.score.team1).toBe(1);
    });
  });
});
