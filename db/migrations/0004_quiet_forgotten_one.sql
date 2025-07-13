ALTER TABLE "knowledge_bases" ADD COLUMN "document_ids" text[];--> statement-breakpoint
ALTER TABLE "knowledge_bases" DROP COLUMN "document_count";