import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        // Premium gold = main brand accent
        gold: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          DEFAULT: "#F59E0B",
        },
        // Indigo retained for secondary
        primary: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
          DEFAULT: "#6366F1",
        },
        success: { DEFAULT: "#10B981", 500: "#10B981", 600: "#059669" },
        cyan: { DEFAULT: "#06B6D4", 400: "#22D3EE", 500: "#06B6D4" },
        bracket: {
          bronze: "#B45309",
          silver: "#94A3B8",
          gold: "#F59E0B",
          platinum: "#818CF8",
          diamond: "#06B6D4",
          legend: "#C026D3",
        },
        // shadcn tokens
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
      },
      borderRadius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
        "gold-gradient":
          "linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)",
        "gold-text":
          "linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)",
        "premium-text":
          "linear-gradient(180deg, #FAFAFA 0%, #A1A1AA 100%)",
        "radial-gold":
          "radial-gradient(circle at center, rgba(251,191,36,0.20) 0%, transparent 70%)",
        "radial-violet":
          "radial-gradient(circle at center, rgba(139,92,246,0.20) 0%, transparent 70%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
      },
      backgroundSize: {
        grid: "60px 60px",
      },
      boxShadow: {
        "glow-gold": "0 0 30px rgba(251,191,36,0.30), 0 0 60px rgba(251,191,36,0.12)",
        "glow-gold-strong": "0 0 40px rgba(251,191,36,0.50), 0 0 80px rgba(251,191,36,0.25)",
        "glow-violet": "0 0 30px rgba(139,92,246,0.30)",
        "glow-cyan": "0 0 30px rgba(6,182,212,0.30)",
        "soft-up": "0 -4px 24px rgba(0,0,0,0.4)",
        "card-hover": "0 0 30px rgba(255,255,255,0.04)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-15px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "fade-up-delayed": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "drift-slow": {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(40px,-30px) scale(1.05)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(251,191,36,0.30)" },
          "50%": { boxShadow: "0 0 40px rgba(251,191,36,0.50)" },
        },
        "border-rotate": {
          "0%": { "--angle": "0deg" } as never,
          "100%": { "--angle": "360deg" } as never,
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "slide-up": "slide-up 0.5s cubic-bezier(0.4,0,0.2,1)",
        "slide-in-left": "slide-in-left 0.4s cubic-bezier(0.4,0,0.2,1)",
        "fade-up-delayed": "fade-up-delayed 0.6s ease-out forwards",
        "drift-slow": "drift-slow 12s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
