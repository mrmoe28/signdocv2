CREATE TABLE "signature_fields" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"signer_id" text NOT NULL,
	"field_type" text DEFAULT 'signature' NOT NULL,
	"page" real DEFAULT 1 NOT NULL,
	"x" real NOT NULL,
	"y" real NOT NULL,
	"width" real DEFAULT 150 NOT NULL,
	"height" real DEFAULT 60 NOT NULL,
	"value" text,
	"required" text DEFAULT 'true' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signers" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"order" real DEFAULT 1 NOT NULL,
	"signed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "signers_email_token_unique" UNIQUE("email_token")
);
--> statement-breakpoint
ALTER TABLE "signature_fields" ADD CONSTRAINT "signature_fields_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signature_fields" ADD CONSTRAINT "signature_fields_signer_id_signers_id_fk" FOREIGN KEY ("signer_id") REFERENCES "public"."signers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signers" ADD CONSTRAINT "signers_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;