import type { Config } from "tailwindcss";

/**
 * FC Polotsk — Tailwind config
 *
 * Brand palette is exposed under the `polotsk` namespace and mirrored on the
 * `primary` namespace for ergonomic class names (`bg-primary`, `text-primary-dark`).
 *
 * - polotsk-500 (#234794) is the canonical brand blue from the club logo.
 * - polotsk-700 / polotsk-900 are deep navy for hovers and dark sections.
 * - polotsk-300 is the light accent (used in eyebrows, large numerals).
 * - ink is the near-black used for the Results section background.
 *
 * Display font: Oswald (cyrillic-supporting). Bebas Neue from the original
 * handoff has no cyrillic subset on Google Fonts.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        polotsk: {
          50: "#eef2fb",
          100: "#d6def4",
          200: "#aebde9",
          300: "#7e96d8",
          400: "#5273c2",
          500: "#234794",
          600: "#1d3c7d",
          700: "#173066",
          800: "#11244e",
          900: "#0a1838",
          950: "#050d22",
        },
        primary: {
          DEFAULT: "#234794",
          dark: "#173066",
          light: "#7e96d8",
          accent: "#5273c2",
        },
        ink: "#0a0e1a",
      },
      fontFamily: {
        display: ["var(--font-display)", "Oswald", "Impact", "sans-serif"],
        body: [
          "var(--font-body)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      letterSpacing: {
        eyebrow: "0.25em",
      },
      maxWidth: {
        "8xl": "88rem",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
