import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ""); // Load all environment variables

  return {
    define: {
      "process.env": env, // Map process.env to the loaded environment variables
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    plugins: [react(), tailwindcss()] as any,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "../public", // Output to the public folder for easy access
      emptyOutDir: false, // Don't empty the public folder
      cssCodeSplit: false, // Bundle all CSS into a single file
      lib: {
        entry: resolve(__dirname, "src/main.tsx"),
        name: "DocaiderEmbed",
        fileName: "embed", // Name the file embed.js
        formats: ["umd"], // Only build UMD format
      },
      rollupOptions: {
        // Don't externalize dependencies - include them all in the bundle
        external: [],
        output: {
          // Generate a single UMD file that includes everything
          entryFileNames: "embed.js",
          format: "umd",
          // Don't generate chunk files - everything in one file
          manualChunks: undefined,
          inlineDynamicImports: true,
          // Extract CSS to a separate file named embed.css
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith(".css")) {
              return "embed.css"; // Fixed name without hash for CSS
            }
            return "assets/[name]-[hash][extname]";
          },
        },
      },
    },
  };
});
