import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // Important: Use :host for Shadow DOM scoping
  important: ":host",
  theme: {
    extend: {
      fontFamily: {
        prompt: ["Prompt", "sans-serif"],
      },
    },
  },
  // Disable dark mode to prevent conflicts with host website
  darkMode: ["class", ":host.dark"],
  plugins: [],
};

export default config;
