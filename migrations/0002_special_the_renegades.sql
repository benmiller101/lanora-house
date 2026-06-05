CREATE TABLE "image_blobs" (
	"key" varchar PRIMARY KEY NOT NULL,
	"data" text NOT NULL,
	"mime_type" varchar DEFAULT 'image/jpeg' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
