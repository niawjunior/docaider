
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectIndexes() {
  console.log("Inspecting indexes...");
  
  // Query pg_indexes to see existing indexes
  const { data: indexes, error } = await supabase
    .rpc('get_indexes'); // We might need to create this RPC or use a raw query if possible via some other way. 
    // Supabase client doesn't support raw SQL directly unless we use the rpc workaround or if we have a function.
    // Actually, we can try to just run a raw query if we had a direct connection, but here we are using the HTTP client.
    // Let's try to use the 'pg_indexes' view directly if we can select from it? 
    // Usually system tables are not exposed to the API.
    
  // Alternative: We can use the 'postgres' library if we had the connection string, but we only have the URL/Key.
  // However, we can create a temporary RPC function to get the indexes.
  
  // Let's try to create the RPC function first via our apply-sql script pattern, then call it.
  console.log("To inspect indexes, we will create a temporary SQL function.");
}

// Actually, I'll just create a SQL file to inspect indexes and run it via the apply-sql script which uses `db.execute(sql.raw(...))`
// That is much easier since I have direct DB access in the scripts via `db/config.ts`.

async function checkIndexes() {
  try {
    // Dynamic import to ensure env vars are loaded
    const { db } = await import("../db/config");
    const { sql } = await import("drizzle-orm");

    const result = await db.execute(sql`
      SELECT tablename, indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename IN ('document_chunks', 'documents', 'knowledge_bases')
      ORDER BY tablename, indexname;
    `);
    
    console.log("Existing Indexes:");
    result.forEach((row: any) => {
      console.log(`Table: ${row.tablename}`);
      console.log(`Index: ${row.indexname}`);
      console.log(`Def: ${row.indexdef}`);
      console.log("---");
    });
  } catch (error) {
    console.error("Error checking indexes:", error);
  }
  process.exit(0);
}

checkIndexes();
