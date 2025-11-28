import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = resolve(__dirname, "..");
const srcDir = resolve(rootDir, "src");

console.log("🎨 Generating styles for Shadow DOM...");

try {
  // 1. Build CSS using Tailwind CLI
  // We use the main tailwind config
  execSync(`npx -y @tailwindcss/cli -i ${resolve(srcDir, "App.css")} -o ${resolve(srcDir, "temp-styles.css")} --minify`, {
    cwd: rootDir,
    stdio: "inherit",
  });

  // 2. Read the generated CSS
  const cssContent = readFileSync(resolve(srcDir, "temp-styles.css"), "utf-8");

  // 3. Write to TS file as a string constant
  const tsContent = `// Auto-generated file. Do not edit.
export const styles = \`${cssContent.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`;
`;

  writeFileSync(resolve(srcDir, "generated-styles.ts"), tsContent);

  // 4. Cleanup
  execSync(`rm ${resolve(srcDir, "temp-styles.css")}`);

  console.log("✅ Styles generated successfully!");
} catch (error) {
  console.error("❌ Error generating styles:", error);
  process.exit(1);
}
