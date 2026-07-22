CREATE EXTENSION IF NOT EXISTS pgcrypto;
--> statement-breakpoint
CREATE TABLE "photo_tags" (
	"photo_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "photo_tags_photo_id_tag_id_pk" PRIMARY KEY("photo_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uploaded_by" uuid,
	"original_filename" varchar(255) NOT NULL,
	"storage_key" varchar(512) NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"width" integer,
	"height" integer,
	"file_size" bigint NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "photos_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "photo_tags_photo_id_idx" ON "photo_tags" USING btree ("photo_id");--> statement-breakpoint
CREATE INDEX "photo_tags_tag_id_idx" ON "photo_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "photos_uploaded_by_idx" ON "photos" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "photos_created_at_idx" ON "photos" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "photos_favorite_idx" ON "photos" USING btree ("favorite");--> statement-breakpoint
CREATE INDEX "tags_name_idx" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");