ALTER TABLE "chats" ADD COLUMN "is_knowledge_base" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "knowledge_base_id" uuid;