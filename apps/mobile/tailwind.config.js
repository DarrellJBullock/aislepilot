const { brand, ink } = require("@aislepilot/design-tokens");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  // AislePilot is a fixed light theme (no dark mode this milestone) — "class"
  // avoids react-native-css-interop's web "media" + manual setColorScheme
  // conflict, since nothing in the app ever toggles a dark class anyway.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand,
        ink,
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
      },
    },
  },
  plugins: [],
};
