CREATE TABLE "knowledge_base_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"knowledge_base_id" uuid NOT NULL,
	"document_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	CONSTRAINT "unique_knowledge_base_document" UNIQUE("knowledge_base_id","document_id")
);
--> statement-breakpoint
ALTER TABLE "knowledge_base_documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "knowledge_bases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false,
	"user_id" uuid NOT NULL,
	"document_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now())
);
--> statement-breakpoint
ALTER TABLE "knowledge_bases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "knowledge_base_documents" ADD CONSTRAINT "knowledge_base_documents_knowledge_base_id_knowledge_bases_id_fk" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."knowledge_bases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_base_documents" ADD CONSTRAINT "knowledge_base_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Users can view their own knowledge base documents" ON "knowledge_base_documents" AS PERMISSIVE FOR SELECT TO public USING (EXISTS (SELECT 1 FROM knowledge_bases kb WHERE kb.id = knowledge_base_id AND kb.user_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "Anyone can view public knowledge base documents" ON "knowledge_base_documents" AS PERMISSIVE FOR SELECT TO public USING (EXISTS (SELECT 1 FROM knowledge_bases kb WHERE kb.id = knowledge_base_id AND kb.is_public = true));--> statement-breakpoint
CREATE POLICY "Users can insert their own knowledge base documents" ON "knowledge_base_documents" AS PERMISSIVE FOR INSERT TO public WITH CHECK (EXISTS (SELECT 1 FROM knowledge_bases kb WHERE kb.id = knowledge_base_id AND kb.user_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "Users can delete their own knowledge base documents" ON "knowledge_base_documents" AS PERMISSIVE FOR DELETE TO public USING (EXISTS (SELECT 1 FROM knowledge_bases kb WHERE kb.id = knowledge_base_id AND kb.user_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "Users can view their own knowledge bases" ON "knowledge_bases" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Anyone can view public knowledge bases" ON "knowledge_bases" AS PERMISSIVE FOR SELECT TO public USING ((is_public = true));--> statement-breakpoint
CREATE POLICY "Users can insert their own knowledge bases" ON "knowledge_bases" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can update their own knowledge bases" ON "knowledge_bases" AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can delete their own knowledge bases" ON "knowledge_bases" AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() = user_id));