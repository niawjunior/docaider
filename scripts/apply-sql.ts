import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  console.log("Loading .env...");
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

async function applySql() {
  const { db } = await import("../db/config");
  const { sql } = await import("drizzle-orm");

  try {
    console.log("Applying match_knowledge_base_detail.sql...");
    const matchKbSql = fs.readFileSync(path.join(process.cwd(), "match_knowledge_base_detail.sql"), "utf8");
    await db.execute(sql.raw(matchKbSql));
    console.log("Successfully applied match_knowledge_base_detail.sql");

    console.log("Applying create_kb_chunks_table.sql...");
    const createTableSql = fs.readFileSync("create_kb_chunks_table.sql", "utf8");
    await db.execute(sql.raw(createTableSql));
    console.log("Successfully applied create_kb_chunks_table.sql");

    console.log("Applying match_kb_chunks.sql...");
    const matchFuncSql = fs.readFileSync("match_kb_chunks.sql", "utf8");
    await db.execute(sql.raw(matchFuncSql));
    console.log("Successfully applied match_kb_chunks.sql");

    console.log("Applying create_hnsw_indexes.sql...");
    const createHnswSql = fs.readFileSync(path.join(process.cwd(), "create_hnsw_indexes.sql"), "utf8");
    await db.execute(sql.raw(createHnswSql));
    console.log("Successfully applied create_hnsw_indexes.sql");

    console.log("Applying match_documents_by_detail_and_content.sql...");
    const matchDocsSql = fs.readFileSync(path.join(process.cwd(), "match_documents_by_detail_and_content.sql"), "utf8");
    await db.execute(sql.raw(matchDocsSql));
    console.log("Successfully applied match_documents_by_detail_and_content.sql");
    
    process.exit(0);
  } catch (error) {
    console.error("Error applying SQL:", error);
    process.exit(1);
  }
}

applySql();
