CREATE TABLE "links" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"original_url" text NOT NULL,
	"remote_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "links_original_url_unique" UNIQUE("original_url"),
	CONSTRAINT "links_remote_url_unique" UNIQUE("remote_url")
);
