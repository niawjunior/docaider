import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

/**
 * Gets a Puppeteer browser instance.
 * - In Development: Uses a local Chrome executable.
 * - In Production: Uses @sparticuz/chromium-min.
 */
export async function getBrowser() {
  const isDev = process.env.NODE_ENV === "development";

  // 1. DEVELOPMENT: Local Chrome
  if (isDev) {
    const localExecutablePath = 
      process.env.CHROMIUM_LOCAL_EXEC_PATH || 
      process.env.PUPPETEER_EXECUTABLE_PATH || 
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; // Safe Mac Default

    console.log(`[PDF] Launching Local Chrome at: ${localExecutablePath}`);

    return await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: localExecutablePath,
      headless: true,
    });
  }

  // 2. PRODUCTION: Sparticuz Chromium
  console.log("[PDF] Launching Sparticuz Chromium...");
  
  // Use provided pack URL or fallback to a known compatible version (v131)
  const remotePackUrl = 
    process.env.CHROMIUM_REMOTE_EXEC_PATH || 
    "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";

  chromium.setGraphicsMode = false;

  return await puppeteer.launch({
    args: chromium.args,
    defaultViewport: null,
    executablePath: await chromium.executablePath(remotePackUrl),
    headless: "shell",
  });
}
