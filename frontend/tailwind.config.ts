import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
      colors: {
        bg: "#0a0a0f",
        surface: "#13131a",
        surface2: "#1c1c28",
        border: "#2a2a3d",
        accent: "#7c6af7",
        accent2: "#e8c4ff",
        amber: "#f5c842",
        muted: "#6b6880",
        primary: {
          50: "rgba(88, 124, 232, 0.05)",
          100: "rgba(88, 124, 232, 0.1)",
          200: "rgba(88, 124, 232, 0.2)",
          300: "rgba(88, 124, 232, 0.3)",
          500: "rgba(88, 124, 232, 0.7)",
          600: "#587ce8",
          700: "#4060cc",
        },
        },
        keyframes: {
          shimmer: {
            "0%": { backgroundPosition: "200% center" },
            "100%": { backgroundPosition: "-200% center" },
          },
          glow: {
            "0%, 100%": { boxShadow: "0 0 10px rgba(88, 124, 232, 0.4)" },
            "50%": { boxShadow: "0 0 25px rgba(88, 124, 232, 0.8)" },
          },
          "fade-up": {
            "0%": { opacity: "0", transform: "translateY(10px)" },
            "100%": { opacity: "1", transform: "translateY(0)" },
          },
        },
        animation: {
          shimmer: "shimmer 8s infinite linear",
          glow: "glow 2.5s infinite ease-in-out",
          "fade-up": "fade-up 0.4s ease-out forwards",
        },
      },
  },
  plugins: [],
};
export default config;
