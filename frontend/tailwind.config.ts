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
        sans: ["var(--font-sans)", "sans-serif"],
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
      },
    },
  },
  plugins: [],
};
export default config;
