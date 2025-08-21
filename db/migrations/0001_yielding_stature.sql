CREATE TYPE "public"."plan_type" AS ENUM('free', 'premium', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid');--> statement-breakpoint
CREATE TABLE "embed_access_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"knowledge_base_id" uuid NOT NULL,
	"chat_id" text NOT NULL,
	"referrer" text,
	"timestamp" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"user_agent" text,
	"ip_address" text
);
--> statement-breakpoint
ALTER TABLE "embed_access_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "embed_message_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"knowledge_base_id" uuid NOT NULL,
	"chat_id" text NOT NULL,
	"message" text NOT NULL,
	"timestamp" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "embed_message_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_id" uuid,
	"stripe_payment_intent_id" text,
	"stripe_invoice_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" text NOT NULL,
	"payment_method" text NOT NULL,
	"receipt_url" text,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"stripe_price_id" text NOT NULL,
	"stripe_product_id" text NOT NULL,
	"type" "plan_type" NOT NULL,
	"price" integer NOT NULL,
	"interval" text NOT NULL,
	"features" jsonb,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"active" boolean DEFAULT true,
	"limits" jsonb
);
--> statement-breakpoint
ALTER TABLE "plans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"stripe_subscription_id" text NOT NULL,
	"status" "subscription_status" NOT NULL,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false,
	"canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "usage_records" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_id" uuid,
	"category" text NOT NULL,
	"quantity" integer NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "usage_records" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_pinned_knowledge_bases" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"knowledge_base_id" uuid NOT NULL,
	"pinned_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
	CONSTRAINT "unique_user_kb_pin" UNIQUE("user_id","knowledge_base_id")
);
--> statement-breakpoint
ALTER TABLE "user_pinned_knowledge_bases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chats" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_config" ALTER COLUMN "theme_preference" SET DEFAULT 'system';--> statement-breakpoint
ALTER TABLE "knowledge_bases" ADD COLUMN "allow_embedding" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "knowledge_bases" ADD COLUMN "embed_config" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "user_config" ADD COLUMN "use_document" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "embed_access_logs" ADD CONSTRAINT "embed_access_logs_knowledge_base_id_knowledge_bases_id_fk" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."knowledge_bases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embed_message_logs" ADD CONSTRAINT "embed_message_logs_knowledge_base_id_knowledge_bases_id_fk" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."knowledge_bases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_pinned_knowledge_bases" ADD CONSTRAINT "user_pinned_knowledge_bases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_pinned_knowledge_bases" ADD CONSTRAINT "user_pinned_knowledge_bases_knowledge_base_id_knowledge_bases_id_fk" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."knowledge_bases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_config" DROP COLUMN "notification_settings";--> statement-breakpoint
ALTER TABLE "user_config" DROP COLUMN "chat_settings";--> statement-breakpoint
ALTER TABLE "user_config" DROP COLUMN "default_currency";--> statement-breakpoint
ALTER TABLE "user_config" DROP COLUMN "timezone";--> statement-breakpoint
CREATE POLICY "Users can read their own chats" ON "chats" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own chats" ON "chats" AS PERMISSIVE FOR INSERT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can update their own chats" ON "chats" AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can delete their own chats" ON "chats" AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Knowledge base owners can view embed access logs" ON "embed_access_logs" AS PERMISSIVE FOR SELECT TO public USING ((
        EXISTS (
          SELECT 1 FROM knowledge_bases kb 
          WHERE kb.id = knowledge_base_id 
          AND kb.user_id = auth.uid()
        )
      ));--> statement-breakpoint
CREATE POLICY "Knowledge base owners can view embed message logs" ON "embed_message_logs" AS PERMISSIVE FOR SELECT TO public USING ((
        EXISTS (
          SELECT 1 FROM knowledge_bases kb 
          WHERE kb.id = knowledge_base_id 
          AND kb.user_id = auth.uid()
        )
      ));--> statement-breakpoint
CREATE POLICY "Users can view their own payments" ON "payments" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Anyone can view active plans" ON "plans" AS PERMISSIVE FOR SELECT TO public USING ((active = true));--> statement-breakpoint
CREATE POLICY "Users can view their own subscriptions" ON "subscriptions" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can view their own usage records" ON "usage_records" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can view their own pins" ON "user_pinned_knowledge_bases" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can create their own pins" ON "user_pinned_knowledge_bases" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can delete their own pins" ON "user_pinned_knowledge_bases" AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() = user_id));