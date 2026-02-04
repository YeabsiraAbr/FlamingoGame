import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: "#050814",
          800: "#0b1230",
          700: "#111b40"
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
        },
        panel: {
          900: "rgba(6, 14, 28, 0.85)",
          800: "rgba(15, 30, 54, 0.82)",
          700: "rgba(21, 41, 70, 0.78)"
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
      backgroundImage: {
        "grid-radial": "radial-gradient(circle at 1px 1px, rgba(111, 240, 255, 0.12) 1px, transparent 0)",
        "hero-glow": "radial-gradient(circle at top, rgba(61, 215, 240, 0.28), transparent 55%)",
        "flare-glow": "radial-gradient(circle at 20% 20%, rgba(255, 77, 146, 0.25), transparent 45%)"
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
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 8s ease infinite"
      }
    }
  },
  plugins: []
};

export default config;
