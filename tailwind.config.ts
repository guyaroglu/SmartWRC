import type { Config } from "tailwindcss";

// Values mirror docs/ui-redesign/_ds/.../tokens/*.css and the approved
// "SmartNet WRC Redesign.dc.html" prototype. Do not eyeball new values here.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // tokens/colors.css
        clay: {
          50: "#FDF4EF",
          100: "#FAE5D9",
          200: "#F3C9B3",
          300: "#E9A586",
          400: "#DC7F59",
          500: "#C95F36",
          600: "#A94A26",
          700: "#85391D",
          800: "#5E2815",
          900: "#3A1A0F",
        },
        honey: {
          50: "#FDF6E8",
          100: "#FAEBC8",
          200: "#F4D791",
          300: "#EDBF57",
          400: "#E8A93A",
          500: "#CE8B22",
          600: "#A46A17",
          700: "#754B10",
        },
        sand: {
          0: "#FFFFFF",
          25: "#FDFAF7",
          50: "#FAF6F1",
          100: "#F3ECE5",
          200: "#E8DED4",
          300: "#D6C8BB",
          400: "#B3A296",
          500: "#8C7D72",
          600: "#6B5D53",
          700: "#4C413A",
          800: "#332B26",
          900: "#211A16",
        },
        olive: {
          100: "#EAF0DF",
          500: "#6E8C46",
          700: "#4E6630",
        },
        rust: {
          100: "#FBE4DE",
          500: "#C2412D",
          700: "#8E2C1D",
        },
        ink: "#211A16",
        paper: "#F3ECE5",
        accent: "#C95F36",
        danger: "#8E2C1D",
        warn: "#754B10",
      },
      fontFamily: {
        // tokens/typography.css --font-sans (Plus Jakarta Sans via next/font)
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        // The prototype never sets line-height on running text, so it renders at
        // the font's "normal" metric. Tailwind's defaults (1.33–1.5) make every row
        // taller than the approved design; keep sizes, restore "normal".
        xs: ["12px", { lineHeight: "normal" }],
        sm: ["14px", { lineHeight: "normal" }],
        base: ["16px", { lineHeight: "normal" }],
        lg: ["17px", { lineHeight: "normal" }],
        xl: ["20px", { lineHeight: "normal" }],
        "2xl": ["24px", { lineHeight: "normal" }],
        // named roles (typography.css + prototype type scale)
        micro: ["11px", { lineHeight: "normal" }],
        caption: ["12px", { lineHeight: "normal" }],
        label: ["13px", { lineHeight: "normal" }],
        body: ["14px", { lineHeight: "normal" }],
        title: ["17px", { lineHeight: "normal" }],
        page: ["26px", { lineHeight: "normal", letterSpacing: "-0.02em" }],
      },
      letterSpacing: {
        // tokens/typography.css
        tightest: "-0.03em",
        tight: "-0.02em",
        snug: "-0.01em",
        eyebrow: "0.06em",
        gate: "0.02em",
      },
      maxWidth: {
        content: "1180px",
        shell: "1400px",
      },
      width: {
        sidebar: "184px",
      },
      height: {
        topbar: "64px",
      },
      minHeight: {
        shell: "900px",
      },
      boxShadow: {
        // tokens/elevation.css
        xs: "0 1px 2px rgba(58,26,15,.05)",
        sm: "0 1px 3px rgba(58,26,15,.06),0 1px 2px rgba(58,26,15,.04)",
        card: "0 2px 8px rgba(58,26,15,.05)",
        raised: "0 8px 24px rgba(58,26,15,.08)",
        overlay: "0 20px 48px rgba(58,26,15,.14)",
        brand: "0 6px 16px rgba(201,95,54,.24)",
        focus: "0 0 0 3px #E9A586",
        "avatar-brand": "0 0 0 2px #F3C9B3",
      },
      borderRadius: {
        // tokens/radius.css + prototype radius roles
        chip: "6px",
        tile: "8px",
        row: "10px",
        panel: "12px",
        card: "16px",
        xl2: "20px",
        shell: "28px",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(.16,1,.3,1)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "180ms",
      },
      scale: {
        press: ".97",
      },
    },
  },
  plugins: [],
};

export default config;
