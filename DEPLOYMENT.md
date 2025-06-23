# Job Invoicer - Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Stripe account for payments

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Job Invoicer App"
git branch -M main
git remote add origin https://github.com/yourusername/job-invoicer.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

### Step 3: Environment Variables
In your Vercel dashboard, add these environment variables:

**Required:**
- `DATABASE_URL` - Your database connection string
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
- `NEXT_PUBLIC_BASE_URL` - Your deployed app URL (e.g., https://your-app.vercel.app)

**Optional:**
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key

### Step 4: Database Setup
If using a cloud database (recommended):
- **Neon** (PostgreSQL): https://neon.tech
- **PlanetScale** (MySQL): https://planetscale.com
- **Supabase** (PostgreSQL): https://supabase.com

Update your `DATABASE_URL` in Vercel environment variables.

### Step 5: Stripe Webhook Setup
1. In Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events: `checkout.session.completed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Step 6: Redeploy
After adding environment variables, trigger a new deployment in Vercel dashboard.

## 🔧 Local Development
```bash
npm install
npm run dev
```

## 📦 Build
```bash
npm run build
npm start
```

## 🗄️ Database Commands
```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
```

## 🌍 Features
- ✅ Invoice management
- ✅ Customer database
- ✅ Stripe payment integration
- ✅ Professional dashboard
- ✅ Settings management
- ✅ Responsive design 