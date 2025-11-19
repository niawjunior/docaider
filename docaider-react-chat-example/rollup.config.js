import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

const config = [
  // Main bundle - ES modules and CommonJS
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/index.esm.js",
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        exclude: ["**/*.test.tsx", "**/*.test.ts"],
      }),
    ],
    external: [
      "react",
      "react-dom",
      "@ai-sdk/react",
      "ai",
      "framer-motion",
      "lucide-react",
    ],
  },
  // Type definitions
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
    external: [
      "react",
      "react-dom",
      "@ai-sdk/react",
      "ai",
      "framer-motion",
      "lucide-react",
    ],
  },
];

export default config;
