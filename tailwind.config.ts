import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: "#050814",
          800: "#0a1628",
          700: "#0f1f3a",
          600: "#162847"
        },
        aqua: {
          300: "#6ff0ff",
          400: "#3bd7f0",
          500: "#18b7d6"
        },
        flare: {
          400: "#ff6aa7",
          500: "#ff4d92",
          600: "#ff2b7a"
        },
        sun: {
          400: "#ffd36b",
          500: "#ffb347"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        glow: "0 0 30px rgba(59, 215, 240, 0.35)",
        flare: "0 0 25px rgba(255, 77, 146, 0.45)",
        glass: "0 20px 50px rgba(5, 8, 20, 0.45)"
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 8s ease infinite",
        pulse: "pulse 2s ease-in-out infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" }
        }
      }
    }
  },
  plugins: []
};

export default config;
