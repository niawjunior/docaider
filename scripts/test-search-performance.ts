
import { config } from "dotenv";

// Load environment variables
config({ path: ".env" });

async function testSearchPerformance() {
  console.log("Testing search performance...");

  const kbId = "cc8d4de8-0146-4e05-8187-2125804627d2"; // The correct KB ID
  const query = "เอกสารที่ Comply ตาม CIS 2.1";

  try {
    // Dynamic import to ensure env vars are loaded
    const { findRelevantDocumentsByDetail, generateEmbedding } = await import("../app/utils/embedding");
    const { createServiceClient } = await import("../app/utils/supabase/server");
    
    console.log(`\n--- Run 1 (Cold) ---`);
    const startTotal = performance.now();
    
    // 1. Measure Embedding Generation
    const startEmbed = performance.now();
    const embedding = await generateEmbedding(query);
    const endEmbed = performance.now();
    console.log(`Embedding Generation: ${(endEmbed - startEmbed).toFixed(2)} ms`);

    // 2. Measure DB Query (using the embedding directly to isolate DB perf)
    const supabase = createServiceClient();
    const startDB = performance.now();
    const { data: docResults, error } = await supabase.rpc(
      "match_documents_by_detail_and_content",
      {
        query_embedding: embedding,
        match_threshold: 0.01,
        match_count: 100,
        document_ids: ['0b2b2fbb-2a29-479d-b8c3-82d93216c588'], // Hardcoded for test
      }
    );
    const endDB = performance.now();
    console.log(`DB Query Time: ${(endDB - startDB).toFixed(2)} ms`);
    console.log(`Total Run 1 Time: ${(performance.now() - startTotal).toFixed(2)} ms`);

    console.log(`\n--- Run 2 (Warm) ---`);
    const startDB2 = performance.now();
    const { data: docResults2 } = await supabase.rpc(
      "match_documents_by_detail_and_content",
      {
        query_embedding: embedding,
        match_threshold: 0.01,
        match_count: 100,
        document_ids: ['0b2b2fbb-2a29-479d-b8c3-82d93216c588'],
      }
    );
    const endDB2 = performance.now();
    console.log(`DB Query Time (Warm): ${(endDB2 - startDB2).toFixed(2)} ms`);
    
  } catch (error) {
    console.error("Error searching:", error);
  }
}

testSearchPerformance();
