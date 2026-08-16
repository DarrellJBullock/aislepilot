// AislePilot design tokens — single source of truth for the web (Tailwind)
// and mobile (NativeWind) apps' visual identity. Values are lifted verbatim
// from the original web tailwind.config.ts; do not fork them per-platform.

export const brand = {
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
} as const;

export const ink = {
  DEFAULT: "#111826",
  soft: "#3b4557",
  muted: "#6b7688",
} as const;

// Neutral/background scale used for page background, card fills, and borders
// across the web app (src/styles/globals.css --background, white cards,
// black/10 borders/dividers per docs/design-system.md).
export const surface = {
  page: "#f7f8fa", // light gray/off-white page background
  card: "#ffffff",
  border: "rgba(0,0,0,0.10)",
  borderSoft: "rgba(0,0,0,0.05)",
} as const;

export const radius = {
  lg: 8, // 0.5rem — small controls (Button sm)
  xl: 16, // 1rem
  "2xl": 24, // 1.5rem — cards
} as const;

export const shadow = {
  card: {
    web: "0 1px 2px rgba(16,24,40,0.04), 0 4px 16px rgba(16,24,40,0.06)",
    // React Native shadow props (iOS) + elevation (Android) approximating the
    // same soft, low-contrast card elevation used on web.
    native: {
      shadowColor: "#101828",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
} as const;

export const motion = {
  slideUp: { durationMs: 200, translateYFrom: 12 },
} as const;

// Semantic status tones used by Badge/StatusPill (src/components/ui/Badge.tsx),
// values matched to the exact Tailwind default palette classes it uses
// (amber/red/blue/green-100/700-800, black/5 neutral).
export const statusTones = {
  brand: { bg: brand[50], text: brand[800] },
  green: { bg: "#dcfce7", text: "#15803d" },
  amber: { bg: "#fef3c7", text: "#92400e" },
  red: { bg: "#fee2e2", text: "#b91c1c" },
  blue: { bg: "#dbeafe", text: "#1d4ed8" },
  neutral: { bg: "rgba(0,0,0,0.05)", text: ink.soft },
} as const;

export type StatusTone = keyof typeof statusTones;
