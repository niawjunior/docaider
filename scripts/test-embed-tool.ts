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

async function testEmbedTool() {
  const knowledgeBaseId = "015140b8-fadf-494c-befe-727559dac3d3"; // Placeholder, will use a real one if available or mock
  // Actually, we need a real KB ID from the previous debug session
  // From logs: knowledgeBaseId is not directly visible, but documentId is fedc12ab-1b3b-4a1f-9bff-068fba2ddf51
  // We can query the KB ID for this document
  
  const supabase = createServiceClient();
  // We will try to find the KB ID from the database first
  const { data: kb } = await supabase
    .from("knowledge_bases")
    .select("id, document_ids")
    .limit(10);
  
  let realKbId = "";
  if (kb) {
    const found = kb.find(k => k.document_ids?.includes("fedc12ab-1b3b-4a1f-9bff-068fba2ddf51"));
    if (found) {
      realKbId = found.id;
    } else if (kb.length > 0) {
      // Fallback to first KB if specific one not found, just to test the function
      realKbId = kb[0].id;
      console.log("Specific KB not found, using first available KB for test.");
    }
  }

  if (!realKbId) {
    console.log("No Knowledge Base found. Creating a temporary one for testing...");
    const { data: newKb, error: createError } = await supabase
      .from("knowledge_bases")
      .insert({
        name: "Test KB",
        description: "Temporary KB for testing",
        document_ids: ["fedc12ab-1b3b-4a1f-9bff-068fba2ddf51"],
        user_id: "e8981567-e3ba-4c00-abe4-c9af0f817d13" // Use the user ID from the debug log
      })
      .select("id")
      .single();
      
    if (createError) {
      console.error("Failed to create test KB:", createError);
      return;
    }
    realKbId = newKb.id;
  }
  console.log(`Using Knowledge Base ID: ${realKbId}`);

  console.log("Testing findRelevantDocumentsByDetail directly...");
  const { findRelevantDocumentsByDetail } = await import("../app/utils/embedding");
  const results = await findRelevantDocumentsByDetail(realKbId, "Pasupol จบจากไหน");
  console.log(`Direct search found ${results.length} results.`);
  if (results.length > 0) {
    console.log("First result content preview:", results[0].content?.substring(0, 50));
  }

  // We can't easily test the tool execution itself because it calls OpenAI and expects a full AI SDK setup,
  // but verifying the underlying function works with the new import is the key step.
}

testEmbedTool();
