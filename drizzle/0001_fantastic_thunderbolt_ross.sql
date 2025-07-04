CREATE TABLE "signature_events" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"event_type" text NOT NULL,
	"event_data" jsonb,
	"user_email" text,
	"ip_address" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signatures" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"signer_name" text NOT NULL,
	"signer_email" text NOT NULL,
	"signature_data" text NOT NULL,
	"signature_type" text DEFAULT 'drawn' NOT NULL,
	"position_x" real NOT NULL,
	"position_y" real NOT NULL,
	"width" real DEFAULT 150 NOT NULL,
	"height" real DEFAULT 60 NOT NULL,
	"page_number" real DEFAULT 1 NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"signed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "signature_fields" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "signers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "audit_logs" CASCADE;--> statement-breakpoint
DROP TABLE "signature_fields" CASCADE;--> statement-breakpoint
DROP TABLE "signers" CASCADE;--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_invoice_id_unique";--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_customer_id_customers_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_customer_id_customers_id_fk";
--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'scheduled';--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "status" SET DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "customer_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "source" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "source" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'new';--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "invoice_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "start_time" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "end_time" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "zipCode" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "tax" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "total" real NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "due_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "paid_date" timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "items" jsonb;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "customer_id" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "method" text DEFAULT 'cash' NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "stripe_id" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "firstName" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "lastName" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "zipCode" text;--> statement-breakpoint
ALTER TABLE "signature_events" ADD CONSTRAINT "signature_events_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "customer";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "customer_email";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "date";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "time";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "duration";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "priority";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "estimated_value";--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "photo_url";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "contact_person";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "customer_type";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "notify_by_email";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "notify_by_sms_text";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "invoice_id";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "customer_name";--> statement-breakpoint
ALTER TABLE "leads" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "leads" DROP COLUMN "score";--> statement-breakpoint
ALTER TABLE "leads" DROP COLUMN "estimated_value";--> statement-breakpoint
ALTER TABLE "leads" DROP COLUMN "probability";--> statement-breakpoint
ALTER TABLE "leads" DROP COLUMN "assigned_to";--> statement-breakpoint
ALTER TABLE "leads" DROP COLUMN "created_date";--> statement-breakpoint
ALTER TABLE "leads" DROP COLUMN "last_contact";--> statement-breakpoint
ALTER TABLE "leads" DROP COLUMN "next_follow_up";--> statement-breakpoint
ALTER TABLE "leads" DROP COLUMN "tags";--> statement-breakpoint
ALTER TABLE "leads" DROP COLUMN "interests";--> statement-breakpoint
ALTER TABLE "leads" DROP COLUMN "priority";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "invoice_number";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "customer_name";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "payment_date";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "payment_method";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "stripe_payment_id";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "customer_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "role";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "is_verified";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "reset_token";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "reset_token_expiry";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "zip_code";--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_number_unique" UNIQUE("number");