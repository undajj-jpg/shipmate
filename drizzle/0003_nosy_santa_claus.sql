CREATE TYPE "public"."build_type" AS ENUM('site', 'landing_page', 'saas', 'automation');--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "build_type" "build_type" DEFAULT 'site' NOT NULL;