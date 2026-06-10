import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212b",
        graphite: "#2f3944",
        steel: "#53616f",
        panel: "#f4f6f3",
        line: "#d8ded8",
        safety: "#f59e0b",
        navy: "#0f2d3f"
      },
      boxShadow: {
        soft: "0 16px 42px rgba(24,33,43,0.12)"
      }
    }
  },
  plugins: []
};

export default config;
