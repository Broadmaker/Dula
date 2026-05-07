/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#4CAF50",
        secondary: "#FF9800",
        background: "#FFFFFF",
        "background-dark": "#121212",
        surface: "#1E1E1E",
        error: "#F44336",
        "on-primary": "#FFFFFF",
      },
      fontFamily: {
        heading: ["Poppins_700Bold"],
        body: ["Inter_400Regular"],
        scoreboard: ["Montserrat_800ExtraBold"],
        caption: ["Inter_300Light"],
      },
    },
  },
  plugins: [],
};
