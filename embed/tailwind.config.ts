import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // Important: Scope all Tailwind utilities to the embed container
  important: "#docaider-embed-container",
  theme: {
    extend: {
      fontFamily: {
        prompt: ["Prompt", "sans-serif"],
      },
    },
  },
  // Disable dark mode to prevent conflicts with host website
  darkMode: ["class", "#docaider-embed-container.dark"],
  plugins: [],
};

export default config;
