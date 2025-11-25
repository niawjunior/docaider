ALTER TABLE "knowledge_bases" ADD COLUMN "detail" text;--> statement-breakpoint
ALTER TABLE "knowledge_bases" ADD COLUMN "detailEmbedding" vector(1536);