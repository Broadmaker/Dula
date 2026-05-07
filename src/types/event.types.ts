export type MatchEvent =
  | { type: "POINT"; teamId: string; timestamp: number; eventId: string }
  | { type: "FAULT"; playerId: string; timestamp: number; eventId: string }
  | { type: "TIMEOUT"; teamId: string; timestamp: number; eventId: string }
  | { type: "UNDO"; timestamp: number; eventId: string }
  | { type: "SIDE_SWITCH"; timestamp: number; eventId: string };
