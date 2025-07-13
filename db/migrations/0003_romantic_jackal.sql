DROP POLICY "Users can view their own knowledge base documents" ON "knowledge_base_documents" CASCADE;--> statement-breakpoint
DROP POLICY "Anyone can view public knowledge base documents" ON "knowledge_base_documents" CASCADE;--> statement-breakpoint
DROP POLICY "Users can insert their own knowledge base documents" ON "knowledge_base_documents" CASCADE;--> statement-breakpoint
DROP POLICY "Users can delete their own knowledge base documents" ON "knowledge_base_documents" CASCADE;--> statement-breakpoint
DROP TABLE "knowledge_base_documents" CASCADE;