ALTER TABLE "signatures" ALTER COLUMN "signature_data" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "signatures" ADD COLUMN "field_type" text DEFAULT 'signature' NOT NULL;--> statement-breakpoint
ALTER TABLE "signatures" ADD COLUMN "text_value" text;--> statement-breakpoint
ALTER TABLE "signatures" ADD COLUMN "font_family" text DEFAULT 'Arial';--> statement-breakpoint
ALTER TABLE "signatures" ADD COLUMN "font_size" real DEFAULT 14;