import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefdf3",
          100: "#d6f9e2",
          200: "#b0f1c9",
          300: "#79e4a8",
          400: "#3fce82",
          500: "#18b365",
          600: "#0c9152",
          700: "#0b7344",
          800: "#0d5b39",
          900: "#0c4a30",
        },
        ink: {
          DEFAULT: "#111826",
          soft: "#3b4557",
          muted: "#6b7688",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 4px 16px rgba(16,24,40,0.06)",
      },
      keyframes: {
        "slide-up": {
          from: { transform: "translateY(12px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
