ALTER TABLE "documents" ADD COLUMN "detail_embedding" vector(1536);--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "detailEmbedding";