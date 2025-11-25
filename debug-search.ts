import { createServiceClient } from "./app/utils/supabase/server";
import { db } from "./db/config";
import { knowledgeBases, documents } from "./db/schema";
import { eq } from "drizzle-orm";

async function debugSearch() {
  try {
    // Get knowledge base info
    const [knowledgeBase] = await db
      .select()
      .from(knowledgeBases)
      .where(eq(knowledgeBases.id, "eec31a66-feb6-4ba2-bbc9-fe3ecddf2fd9")); // You'll need to replace this

    console.log("Knowledge base:", knowledgeBase);

    // Check what documents exist for this knowledge base
    if (knowledgeBase?.documentIds) {
      const allDocs = await db
        .select()
        .from(documents)
        .where(eq(documents.document_id, knowledgeBase.documentIds[0])); // Check first doc

      console.log("First document:", allDocs[0]);

      // Check if there are any chunks
      const supabase = createServiceClient();
      const { data: chunks, error: chunkError } = await supabase
        .from("document_chunks")
        .select("*")
        .eq("document_id", knowledgeBase.documentIds[0])
        .limit(5);

      console.log("Sample chunks:", chunks);
      console.log("Chunk error:", chunkError);
    }
  } catch (error) {
    console.error("Debug error:", error);
  }
}

debugSearch();
