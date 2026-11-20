import type { Config } from "tailwindcss";

/**
 * Pickova design tokens — taken from the brand board. Only the four brand
 * colours are used; the navy/orange tints below are derived from them.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1B2A4A",
          50: "#F1F3F7",
          100: "#DDE2EB",
          200: "#B9C2D4",
          300: "#8E9AB5",
          400: "#5F6E90",
          500: "#3B4A6E",
          600: "#27375A",
          700: "#1B2A4A",
          800: "#14213D",
          900: "#0D172D",
        },
        orange: {
          DEFAULT: "#F28C28",
          50: "#FEF5EB",
          100: "#FDE7CD",
          200: "#FACD9A",
          300: "#F7B266",
          400: "#F59F45",
          500: "#F28C28",
          600: "#DB7711",
          700: "#B4600C",
        },
        offwhite: "#FAF7F2",
        line: "#E9E3D9",
        // Functional status colours (forms, stock) — not brand colours.
        success: "#1F7A4D",
        danger: "#C0362C",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "1.25rem",
      },
      maxWidth: {
        content: "82rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(27,42,74,0.04), 0 8px 24px -12px rgba(27,42,74,0.12)",
        "card-hover": "0 2px 4px rgba(27,42,74,0.05), 0 18px 36px -14px rgba(27,42,74,0.22)",
        glow: "0 10px 30px -8px rgba(242,140,40,0.55)",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        float: { "0%,100%": { transform: "translateY(0) rotate(-14deg)" }, "50%": { transform: "translateY(-10px) rotate(-14deg)" } },
        "slide-in": { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(0)" } },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        float: "float 6s ease-in-out infinite",
        "slide-in": "slide-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
