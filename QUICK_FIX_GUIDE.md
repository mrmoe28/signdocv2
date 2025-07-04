# 🚨 Quick Fix Guide - Immediate Solutions

## 📋 The Issues You're Seeing

1. **Stack Auth Error**: "Welcome to Stack Auth! It seems that you haven't provided a project ID"
2. **Database Upload Error**: Foreign key constraint violation (temp-user-123 doesn't exist)

## 🔧 Immediate Fixes (2 Minutes)

### Step 1: Create `.env.local` File

Create a file called `.env.local` in your project root with this content:

```bash
# Database Configuration
DATABASE_URL="postgresql://neondb_owner:npg_FYveqcDT3C6K@ep-twilight-bar-a8r4wbmj-pooler.eastus2.azure.neon.tech/neondb?sslmode=require"

# Stack Auth Configuration
NEXT_PUBLIC_STACK_PROJECT_ID=proj_01h8b9tzjhzzzd3z5k2sjxvr9g
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pk_01h8b9tzjhzzzd3z5k2sjxvr9g
STACK_SECRET_SERVER_KEY=sk_01h8b9tzjhzzzd3z5k2sjxvr9g

# DocuSeal Configuration (Add your token when ready)
DOCUSEAL_TOKEN=your_docuseal_api_token_here

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### Step 2: Create Temp User in Database

Open your database console (Neon dashboard) and run this SQL:

```sql
-- Create temp user for development
INSERT INTO users (
  id, 
  email, 
  name, 
  "firstName", 
  "lastName", 
  company, 
  phone, 
  address, 
  city, 
  state, 
  "zipCode",
  "createdAt",
  "updatedAt"
) VALUES (
  'temp-user-123',
  'temp@localhost.dev',
  'Temporary User',
  'Temp',
  'User',
  'Dev Environment',
  '(555) 000-0000',
  '123 Dev Street',
  'Development',
  'CA',
  '00000',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
```

### Step 3: Start Your App

Now run your app normally:

```bash
npm run dev
```

## ✅ Expected Results

- ✅ No more Stack Auth errors
- ✅ PDF uploads will work
- ✅ Documents page loads properly
- ✅ Ready for DocuSeal integration

## 🎯 Quick Test

1. **Visit**: <http://localhost:3001/documents>
2. **Upload**: A PDF file
3. **Verify**: No errors in console
4. **Success**: You should see the uploaded document in the list

## 🔄 Alternative: One-Command Startup

If you prefer, you can still start with environment variables in the command:

```bash
DATABASE_URL="postgresql://neondb_owner:npg_FYveqcDT3C6K@ep-twilight-bar-a8r4wbmj-pooler.eastus2.azure.neon.tech/neondb?sslmode=require" NEXT_PUBLIC_STACK_PROJECT_ID=proj_01h8b9tzjhzzzd3z5k2sjxvr9g NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pk_01h8b9tzjhzzzd3z5k2sjxvr9g STACK_SECRET_SERVER_KEY=sk_01h8b9tzjhzzzd3z5k2sjxvr9g npm run dev
```

But you'll still need to create the temp user in the database.

## 📞 Need Help?

If you're still having issues:

1. **Check .env.local exists** in your project root
2. **Verify temp user created** in your database  
3. **Restart your development server**
4. **Clear browser cache** if needed

## 🚀 Next Steps After Fixing

Once everything works:

1. **Test PDF Upload** - Upload a sample PDF
2. **Get DocuSeal Token** - Sign up at docuseal.com for e-signatures
3. **Add Token** to your .env.local file
4. **Test E-Signature Flow** - Click the blue "E-Sign" button

---

**These fixes will get you back up and running immediately!** 🎉
