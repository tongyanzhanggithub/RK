import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0d1b2a",
        graphite: "#2f3944",
        steel: "#53616f",
        panel: "#f4f6f3",
        line: "#d8ded8",
        safety: "#f59e0b",
        navy: "#0b2545",
        brand: "#2b6cf6"
      },
      boxShadow: {
        soft: "0 16px 42px rgba(24,33,43,0.12)"
      }
    }
  },
  plugins: []
};

export default config;
