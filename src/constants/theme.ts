export const colors = {
  primary: "#4CAF50", // CTAs, active state, score tap
  secondary: "#FF9800", // Serve indicator, highlights
  background: "#FFFFFF", // Light mode background
  backgroundDark: "#121212", // Dark mode background
  surface: "#1E1E1E", // Cards in dark mode
  error: "#F44336", // Fault, timeout, error state
  onPrimary: "#FFFFFF", // Text/icon on primary
} as const;

export const fonts = {
  heading: "Poppins_700Bold",
  body: "Inter_400Regular",
  scoreboard: "Montserrat_800ExtraBold",
  caption: "Inter_300Light",
} as const;
