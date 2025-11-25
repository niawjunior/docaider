
import { config } from "dotenv";

// Load environment variables
config({ path: ".env" });

async function reprocessKbDetail() {
  console.log("Reprocessing KB detail...");

  const kbId = "cc8d4de8-0146-4e05-8187-2125804627d2";

  try {
    // Dynamic import
    const { processKnowledgeBaseDetail } = await import("../app/utils/embedding");
    const { db } = await import("../db/config");
    const { knowledgeBases } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    
    // Fetch the KB to get the detail
    const kb = await db.query.knowledgeBases.findFirst({
      where: eq(knowledgeBases.id, kbId),
    });
    
    if (!kb) {
      console.error("KB not found");
      return;
    }
    
    console.log(`Found KB: ${kb.name}`);
    console.log(`Detail length: ${kb.detail?.length}`);
    
    // Trigger processing
    await processKnowledgeBaseDetail(kbId);
    
    console.log("Reprocessing complete.");
    
  } catch (error) {
    console.error("Error reprocessing:", error);
  }
  process.exit(0);
}

reprocessKbDetail();
