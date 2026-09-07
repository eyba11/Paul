import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070908",
          900: "#0b0e0c",
          800: "#121714",
          700: "#1a211c",
          600: "#24302a",
        },
        volt: {
          DEFAULT: "#d4ff3a",
          dim: "#9fbf2c",
        },
        mist: "#9aa89f",
        foam: "#e8eee6",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        display: ["var(--font-barlow)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(212, 255, 58, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
