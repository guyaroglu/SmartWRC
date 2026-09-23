import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
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
      maxWidth: {
        content: "1180px",
        shell: "1400px",
      },
      width: {
        sidebar: "184px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(58,26,15,.05)",
        raised: "0 8px 24px rgba(58,26,15,.08)",
        overlay: "0 20px 48px rgba(58,26,15,.14)",
      },
      borderRadius: {
        card: "16px",
        shell: "28px",
      },
    },
  },
  plugins: [],
};

export default config;
