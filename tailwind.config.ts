import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#0A6640",
          "green-dark": "#0d7a4d",
          "green-deep": "#0A4E30",
          ink: "#0A3D26",
          gold: "#FFB300",
          "gold-hover": "#FFC733",
          "gold-deep": "#E5A100",
          bg: "#FBF7EE",
          card: "#FFFFFF",
          muted: "#6b7a70",
          "muted-2": "#8a9a8e",
          line: "#F0EBDD",
          "line-2": "#E2DCC9",
          danger: "#aa3355",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
        btn: "8px",
      },
      maxWidth: {
        content: "1280px",
        narrow: "1000px",
      },
      keyframes: {
        "slide-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.25s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
