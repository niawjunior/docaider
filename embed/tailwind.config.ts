import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // Important: Use .docaider-embed for scoping (works in both Shadow DOM and Light DOM)
  important: ".docaider-embed",
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
      },
    },
  },
  // Disable dark mode to prevent conflicts with host website
  darkMode: ["class", ":host.dark"],
  plugins: [],
};

export default config;
