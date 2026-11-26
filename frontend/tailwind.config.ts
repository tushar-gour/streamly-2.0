import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./stores/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinematic: "#080B13",
        night: "#0D111B",
        graphite: "#111521",
        elevated: "#181D2B",
        indigo: "#6C5CE7",
        periwinkle: "var(--color-accent-soft)",
        lavender: "#A79CFF",
        cloud: "#F5F7FA",
        muted: "#9AA2B3",
        border: "#252B3A",
      },
      borderRadius: {
        input: "10px",
        card: "14px",
        modal: "18px",
        hero: "24px",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0, 0, 0, 0.35)",
        glow: "0 0 0 1px rgba(141, 132, 255, 0.12), 0 20px 70px rgba(108, 92, 231, 0.12)",
      },
      transitionTimingFunction: {
        streamly: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
