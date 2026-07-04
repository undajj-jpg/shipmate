CREATE TYPE "public"."passthrough_category" AS ENUM('hosting', 'ai_usage', 'domain', 'database', 'email', 'other');--> statement-breakpoint
CREATE TYPE "public"."passthrough_status" AS ENUM('pending', 'invoiced', 'paid');--> statement-breakpoint
CREATE TABLE "passthrough_charges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"period" text NOT NULL,
	"category" "passthrough_category" NOT NULL,
	"description" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"stripe_invoice_item_id" text,
	"status" "passthrough_status" DEFAULT 'pending' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "terms_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "terms_version" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "cost_policy_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "passthrough_charges" ADD CONSTRAINT "passthrough_charges_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passthrough_charges" ADD CONSTRAINT "passthrough_charges_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;