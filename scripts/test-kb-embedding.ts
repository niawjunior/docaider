import { createServiceClient } from "../app/utils/supabase/server";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables immediately
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

async function testKbEmbedding() {
  const { processKnowledgeBaseDetail, findRelevantDocumentsByDetail } = await import("../app/utils/embedding");
  const { db } = await import("../db/config");
  const { knowledgeBases } = await import("../db/schema");
  const { eq } = await import("drizzle-orm");

  const supabase = createServiceClient();
  
  // 1. Create a test KB with detail
  console.log("Creating test KB...");
  const kbName = "Test KB with Detail";
  const kbDetail = "CIS Control 4.2: Establish and Maintain a Secure Configuration Process for Network Infrastructure. Review and update documentation annually.";
  
  // Check if KB already exists
  const [existingKb] = await db
    .select()
    .from(knowledgeBases)
    .where(eq(knowledgeBases.name, kbName));
    
  let kbId = existingKb?.id;
  
  if (!kbId) {
    const [newKb] = await db.insert(knowledgeBases).values({
      name: kbName,
      description: "Test KB for embedding",
      detail: kbDetail,
      userId: "e8981567-e3ba-4c00-abe4-c9af0f817d13", // Use known user ID
      documentIds: []
    }).returning();
    kbId = newKb.id;
    console.log("Created new KB:", kbId);
  } else {
    console.log("Using existing KB:", kbId);
    // Update detail just in case
    await db.update(knowledgeBases).set({ detail: kbDetail }).where(eq(knowledgeBases.id, kbId));
  }
  
  // 2. Generate embedding for the KB
  console.log("Generating embedding for KB...");
  const success = await processKnowledgeBaseDetail(kbId);
  if (!success) {
    console.error("Failed to generate embedding");
    return;
  }
  
  // 3. Search for something that matches the detail
  console.log("Searching for 'CIS 4.2'...");
  const results = await findRelevantDocumentsByDetail(kbId, "What is CIS 4.2?");
  
  console.log(`Found ${results.length} results.`);
  if (results.length > 0) {
    console.log("First result:", {
      title: results[0].title,
      similarity: results[0].similarity,
      contentPreview: results[0].content?.substring(0, 100)
    });
    
    // Check if the first result is the KB itself
    if (results[0].documentId === kbId) {
      console.log("SUCCESS: Found KB detail match!");
    } else {
      console.log("WARNING: First result is not the KB detail.");
    }
  } else {
    console.log("FAILURE: No results found.");
  }
}

testKbEmbedding();
