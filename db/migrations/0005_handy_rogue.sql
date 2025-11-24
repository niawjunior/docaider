ALTER TABLE "documents" ADD COLUMN "detail" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "detailEmbedding" vector(1536);