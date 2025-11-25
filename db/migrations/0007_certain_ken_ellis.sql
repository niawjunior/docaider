ALTER TABLE "knowledge_bases" ADD COLUMN "detail_embedding" vector(1536);--> statement-breakpoint
ALTER TABLE "knowledge_bases" DROP COLUMN "detailEmbedding";