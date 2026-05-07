import { format, parseISO } from "date-fns";

/**
 * Formats an ISO 8601 date string for match display (e.g., "May 7, 2026").
 */
export const formatMatchDate = (isoString: string): string => {
  try {
    return format(parseISO(isoString), "PPP");
  } catch (error) {
    return "Invalid Date";
  }
};

/**
 * Formats duration in seconds to "MM:SS" or "H:MM:SS".
 */
export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (h > 0) parts.push(h);
  parts.push(m.toString().padStart(h > 0 ? 2 : 1, "0"));
  parts.push(s.toString().padStart(2, "0"));

  return parts.join(":");
};
