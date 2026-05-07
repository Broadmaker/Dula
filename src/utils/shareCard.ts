import type { Match } from "@/types/match.types";
import { formatMatchDate, formatDuration } from "./formatDate";

export interface ShareCardData {
  winnerName: string;
  finalScore: string;
  teamAName: string;
  teamBName: string;
  matchType: string;
  duration: string;
  date: string;
}

/**
 * Pure function to build the data object required for the Share Card UI.
 */
export const buildShareCardData = (match: Match): ShareCardData => {
  const teamA = match.teams[0];
  const teamB = match.teams[1];
  const scoreA = match.score[teamA.id] || 0;
  const scoreB = match.score[teamB.id] || 0;

  let winnerName = "Draw";
  if (scoreA > scoreB) {
    winnerName = teamA.name;
  } else if (scoreB > scoreA) {
    winnerName = teamB.name;
  }

  return {
    winnerName: scoreA !== scoreB ? `${winnerName} Wins!` : "Draw",
    finalScore: `${scoreA} — ${scoreB}`,
    teamAName: teamA.name,
    teamBName: teamB.name,
    matchType: match.type.charAt(0).toUpperCase() + match.type.slice(1),
    duration: match.durationSeconds ? formatDuration(match.durationSeconds) : "0:00",
    date: match.completedAt ? formatMatchDate(match.completedAt) : "Unknown Date",
  };
};
