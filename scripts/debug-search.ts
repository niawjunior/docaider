import { createServiceClient } from "../app/utils/supabase/server";
import { generateEmbedding } from "../app/utils/embedding";
import { db } from "../db/config";
import { documents } from "../db/schema";
import { eq } from "drizzle-orm";
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
} else {
  console.warn("No .env found!");
}

async function runDebug() {
  const documentId = "fedc12ab-1b3b-4a1f-9bff-068fba2ddf51"; // From user logs
  const question = "Pasupol จบจากไหน";
  
  console.log("--- START DEBUGGING ---");
  console.log(`Target Document ID: ${documentId}`);
  console.log(`Question: ${question}`);

  const supabase = createServiceClient();

  // 1. Check Document Status
  console.log("\n1. Checking Document Status...");
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("document_id", documentId)
    .single();
  
  if (docError) {
    console.error("Error fetching document:", docError);
    return;
  }
  console.log("Document found:", {
    id: doc.id,
    title: doc.title,
    active: doc.active,
    is_knowledge_base: doc.is_knowledge_base,
    user_id: doc.user_id
  });

  // 2. Check Chunks Existence
  console.log("\n2. Checking Document Chunks...");
  const { data: chunks, error: chunksError } = await supabase
    .from("document_chunks")
    .select("id, chunk, active, is_knowledge_base")
    .eq("document_id", documentId)
    .limit(5);

  if (chunksError) {
    console.error("Error fetching chunks:", chunksError);
  } else {
    console.log(`Found ${chunks?.length} chunks (showing first 5):`);
    chunks?.forEach((c, i) => {
      console.log(`Chunk ${i}:`, {
        id: c.id,
        active: c.active,
        is_knowledge_base: c.is_knowledge_base,
        preview: c.chunk.substring(0, 50) + "..."
      });
    });
  }

  // 2.5 Check for ANY chunks with "Pasupol"
  console.log("\n2.5 Checking for ANY chunks containing 'Pasupol'...");
  const { data: globalChunks, error: globalChunksError } = await supabase
    .from("document_chunks")
    .select("id, document_id, chunk")
    .ilike("chunk", "%Pasupol%")
    .limit(5);

  if (globalChunksError) {
    console.error("Error searching global chunks:", globalChunksError);
  } else {
    console.log(`Found ${globalChunks?.length} chunks containing 'Pasupol':`);
    globalChunks?.forEach((c) => {
      console.log(`- Chunk ID: ${c.id}, Doc ID: ${c.document_id}, Preview: ${c.chunk.substring(0, 50)}...`);
    });
  }

  // 2.6 Count total chunks
  const { count, error: countError } = await supabase
    .from("document_chunks")
    .select("*", { count: "exact", head: true });
  console.log(`\nTotal chunks in table: ${count} (Error: ${countError?.message || "None"})`);

  // 3. Generate Embedding
  console.log("\n3. Generating Question Embedding...");
  try {
    const embedding = await generateEmbedding(question);
    console.log(`Embedding generated. Length: ${embedding.length}`);

    // 4. Run Search Function
    console.log("\n4. Running match_documents_by_detail_and_content...");
    const { data: results, error: searchError } = await supabase.rpc(
      "match_documents_by_detail_and_content",
      {
        query_embedding: embedding,
        match_threshold: 0.001, // Extremely low threshold for debug
        match_count: 10,
        document_ids: [documentId],
      }
    );

    if (searchError) {
      console.error("Search function error:", searchError);
    } else {
      console.log(`Search returned ${results?.length} results:`);
      results?.forEach((r: any, i: number) => {
        console.log(`Result ${i}:`, {
          title: r.title,
          similarity: r.similarity,
          match_type: r.match_type,
          has_content: !!r.chunk_content,
          content_preview: r.chunk_content ? r.chunk_content.substring(0, 50) + "..." : "NULL"
        });
      });
    }

  } catch (err) {
    console.error("Error generating embedding or running search:", err);
  }
  
  console.log("\n--- END DEBUGGING ---");
}

runDebug();
