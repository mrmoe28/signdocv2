# Stripe Payment Integration Setup

This guide explains how to configure and use the Stripe payment integration for processing invoice payments.

## 🚀 Quick Setup

### 1. Install Dependencies

The following packages have been added to the project:

```bash
npm install stripe @prisma/client prisma
```

### 2. Environment Variables

Create a `.env.local` file in your project root and add:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database Configuration
DATABASE_URL="file:./dev.db"
```

**To get your Stripe keys:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Secret Key** (starts with `sk_test_` for test mode)
3. For the webhook secret, create a webhook endpoint (see below)

### 3. Database Setup

The database has been configured with SQLite and includes an Invoice model:

```bash
# Generate Prisma client
npm run db:generate

# Apply database migrations
npm run db:migrate

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 4. Webhook Configuration

Set up a webhook in your Stripe Dashboard:

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Use URL: `https://your-domain.com/api/stripe/webhook`
4. Select event: `checkout.session.completed`
5. Copy the webhook signing secret to your `.env.local`

## 📁 Files Created

### API Routes (App Router)

- `src/app/api/stripe/checkout/route.ts` - Creates Stripe checkout sessions
- `src/app/api/stripe/webhook/route.ts` - Handles payment completion webhooks

### Database & Utilities  

- `src/lib/db.ts` - Prisma client configuration
- `prisma/schema.prisma` - Database schema with Invoice model
- Updated `src/lib/invoice-utils.ts` - Added `createStripeCheckoutSession()` utility

## 🔧 Usage

To integrate Stripe payments into your UI components, use the utility function:

```typescript
import { createStripeCheckoutSession } from '@/lib/invoice-utils';

const handlePayment = async () => {
  const result = await createStripeCheckoutSession(
    'invoice-123',
    99.99,
    'Payment for Invoice #123'
  );

  if ('sessionUrl' in result) {
    // Redirect to Stripe Checkout
    window.location.href = result.sessionUrl;
  } else {
    // Handle error
    console.error(result.error);
  }
};
```

## 💳 Payment Flow

1. **Customer clicks "Pay Now"** on an invoice
2. **Frontend calls** `createStripeCheckoutSession()` utility
3. **API creates** Stripe checkout session with invoice details
4. **Customer redirects** to Stripe-hosted payment page
5. **After payment**, customer returns to success/cancel URL
6. **Stripe webhook** automatically updates invoice status to "Paid"

## 🛡️ Security Features

- ✅ **Webhook signature verification** prevents unauthorized status updates
- ✅ **Server-side validation** of all payment data
- ✅ **Metadata tracking** links payments to specific invoices
- ✅ **Error handling** with proper HTTP status codes

## 🧪 Testing

Use Stripe's test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0000 0000 3220`

## 📊 Database Schema

```prisma
model Invoice {
  id          String   @id @default(cuid())
  invoiceId   String   @unique
  customerName String
  amount      Float
  description String?
  status      String   @default("Pending") // "Pending" | "Paid" | "Failed"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🔄 Available Scripts

```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run database migrations  
npm run db:studio      # Open Prisma Studio
```

---

## ⚠️ Important Notes

- This integration does **NOT** modify existing UI components
- Payment status updates happen automatically via webhooks
- Test mode uses Stripe's test environment - no real charges
- For production, use live API keys and configure webhook URLs accordingly
