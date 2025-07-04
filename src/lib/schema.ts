import { pgTable, text, timestamp, real, jsonb } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  name: text('name'),
  firstName: text('firstName'),
  lastName: text('lastName'),
  company: text('company'),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zipCode'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const customers = pgTable('customers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zipCode'),
  company: text('company'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  number: text('number').notNull().unique(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  tax: real('tax').notNull().default(0),
  total: real('total').notNull(),
  status: text('status').notNull().default('draft'),
  dueDate: timestamp('due_date').notNull(),
  paidDate: timestamp('paid_date'),
  description: text('description'),
  items: jsonb('items'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const leads = pgTable('leads', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  company: text('company'),
  source: text('source'),
  status: text('status').notNull().default('new'),
  notes: text('notes'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const appointments = pgTable('appointments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  location: text('location'),
  status: text('status').notNull().default('scheduled'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const payments = pgTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  method: text('method').notNull().default('cash'),
  status: text('status').notNull().default('pending'),
  stripeId: text('stripe_id'),
  description: text('description'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const documents = pgTable('documents', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  fileUrl: text('file_url').notNull(),
  status: text('status').notNull().default('draft'),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  senderEmail: text('sender_email').notNull(),
  recipientEmail: text('recipient_email'),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  sentAt: timestamp('sent_at'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const signers = pgTable('signers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  emailToken: text('email_token').notNull().unique(),
  status: text('status').notNull().default('pending'),
  order: real('order').notNull().default(1),
  signedAt: timestamp('signed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const signatureFields = pgTable('signature_fields', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  signerId: text('signer_id').notNull().references(() => signers.id, { onDelete: 'cascade' }),
  fieldType: text('field_type').notNull().default('signature'), // signature, text, date, initials
  page: real('page').notNull().default(1),
  x: real('x').notNull(),
  y: real('y').notNull(),
  width: real('width').notNull().default(150),
  height: real('height').notNull().default(60),
  value: text('value'), // signature data (base64) or text value
  required: text('required').notNull().default('true'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const signatures = pgTable('signatures', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  signerName: text('signer_name').notNull(),
  signerEmail: text('signer_email').notNull(),
  signatureData: text('signature_data'), // base64 encoded signature image (optional for text fields)
  fieldType: text('field_type').notNull().default('signature'), // signature, text, date, initials
  textValue: text('text_value'), // for text, date, initials fields
  fontFamily: text('font_family').default('Arial'),
  fontSize: real('font_size').default(14),
  signatureType: text('signature_type').notNull().default('drawn'), // drawn, typed, uploaded
  positionX: real('position_x').notNull(),
  positionY: real('position_y').notNull(),
  width: real('width').notNull().default(150),
  height: real('height').notNull().default(60),
  pageNumber: real('page_number').notNull().default(1),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  signedAt: timestamp('signed_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const signatureEvents = pgTable('signature_events', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(), // requested, viewed, signed, completed
  eventData: jsonb('event_data'),
  userEmail: text('user_email'),
  ipAddress: text('ip_address'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

// Export all tables for easy access
export const schema = {
  users,
  customers,
  invoices,
  leads,
  appointments,
  payments,
  documents,
  signers,
  signatureFields,
  signatures,
  signatureEvents,
};