
import { db } from "../db/config";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { config } from "dotenv";

config({ path: ".env" });

async function main() {
  try {
    // Dynamic import
    const { db } = await import("../db/config");
    const { sql } = await import("drizzle-orm");

    console.log("Applying add_kb_instruction.sql...");
    const sqlContent = fs.readFileSync(
      path.join(__dirname, "../add_kb_instruction.sql"),
      "utf-8"
    );
    await db.execute(sql.raw(sqlContent));
    console.log("Successfully applied add_kb_instruction.sql");
  } catch (error) {
    console.error("Error applying SQL:", error);
  }
  process.exit(0);
}

main();
