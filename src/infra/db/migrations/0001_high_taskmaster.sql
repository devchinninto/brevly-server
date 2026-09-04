CREATE TABLE "urls" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"original_url" text NOT NULL,
	"short_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "urls_original_url_unique" UNIQUE("original_url"),
	CONSTRAINT "urls_short_url_unique" UNIQUE("short_url")
);
--> statement-breakpoint
DROP TABLE "links" CASCADE;