import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102033",
        paper: "#f6f7f9",
        accent: "#0f6e56",
        danger: "#9b1c2c",
        warn: "#9a6700",
      },
    },
  },
  plugins: [],
};

export default config;
