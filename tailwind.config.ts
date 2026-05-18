import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0b3d91",
          dark: "#072a66",
        },
      },
    },
  },
  plugins: [],
};
export default config;
