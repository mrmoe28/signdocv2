# App Context: Markate "Invoices & Payments" Clone

## Overview

We are building a full-featured clone of the **Markate Invoices & Payments** app inside Cursor. This tool allows users to create, send, manage, and track invoices for service-based businesses. It includes job details, payment status, and record history.

---

## 🧩 Core Pages

### 1. Invoice Editor Page

- Editable invoice fields:
  - Customer
  - Job location
  - Job name (optional)
  - Invoice items
- Dynamic line items (add/remove)
  - Services or products
  - Quantity, price, tax, discount
- Totals calculation
  - Auto subtotal
  - Optional adjustments

### 2. Invoices List Page

- Tabs: All, Due, Overdue, Paid
- Status indicators: Paid, Overdue, Draft
- Sort & search by:
  - Customer
  - Status
  - Date
- Manage dropdown for each invoice (View, Edit, Delete, Record Payment)

### 3. Invoice Viewer Page

- Read-only invoice preview
- Company & customer info
- Line item breakdown
- Terms and payment methods
- Invoice history/logs:
  - Reminder emails
  - System updates
  - Payment confirmations

---

## 🏗️ Tech Stack (for Cursor)

- **Frontend:** Next.js with Tailwind CSS
- **Backend:** Node.js + Express or Next.js API routes
- **Database:** PostgreSQL with Prisma
- **Auth:** Clerk or NextAuth (email-based login)
- **Storage:** Supabase Storage or self-hosted S3
- **PDF Generation:** react-pdf or server-side pdfkit
- **UI Kit:** shadcn/ui or Radix

---

## 🔧 Key Features

- Customer & contact management
- Multi-line invoice builder
- Auto tax/discount/subtotal calculations
- Status tracking (paid/due/overdue)
- Email reminder system with log history
- Exportable printable PDF view
- Sorting, searching, and filtering invoices

---

## ✅ Components To Scaffold

- `InvoiceForm.tsx` — for creating/editing invoices
- `InvoiceList.tsx` — for managing and browsing invoices
- `InvoiceView.tsx` — for rendering the read-only invoice view
- `API Routes` — CRUD operations for invoices

---

## Development Goals

Start with a clean MVP and gradually expand to match full Markate functionality. Follow best practices for component isolation, form validation, and database modeling.
