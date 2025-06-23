# 🧾 Job Invoicer

A professional invoice management application built with modern web technologies. Streamline your business operations with comprehensive invoicing, customer management, and payment processing.

## ✨ Features

### 🏠 **Professional Landing Page**
- Modern, responsive design
- Business statistics dashboard
- Feature highlights and benefits

### 📋 **Invoice Management**
- Create, edit, view, and delete invoices
- Professional invoice templates
- Automatic calculations (subtotal, tax, total)
- Invoice status tracking (Draft, Sent, Paid, Overdue)
- Send payment reminders

### 👥 **Customer Database**
- Complete customer management (CRUD operations)
- Autocomplete search functionality
- Customer profiles with contact information
- Add customers directly from invoice form

### 💳 **Stripe Payment Integration**
- Secure online payments
- Automatic invoice status updates
- Payment success/failure handling
- Webhook integration for real-time updates

### ⚙️ **Comprehensive Settings**
- **Email & SMS Templates** - Customizable message templates
- **Tax Rates Management** - Configure tax settings
- **Customer Management** - Advanced customer database
- **Email Settings** - SMTP configuration
- **Notifications** - Email, push, and SMS preferences
- **Files Vault** - Document storage and management
- **My Business** - Business profile and branding

### 🎨 **Modern UI/UX**
- Responsive design for all devices
- Professional sidebar navigation
- Form validation with visual feedback
- Loading states and error handling
- Clean, intuitive interface

## 🛠 Tech Stack

- **Frontend**: React 18, Next.js 15, TypeScript
- **Styling**: TailwindCSS, Shadcn/ui components
- **Database**: Prisma ORM with SQLite (development)
- **Payments**: Stripe integration
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mrmoe28/job-invoicer.git
   cd job-invoicer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your environment variables:
   ```env
   DATABASE_URL="file:./dev.db"
   STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

## 🔧 Configuration

### Stripe Setup
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe dashboard
3. Set up webhooks pointing to `/api/stripe/webhook`
4. Add the webhook secret to your environment variables

### Database Setup
The app uses SQLite by default for development. For production, you can use:
- **PostgreSQL** (recommended for Vercel)
- **MySQL**
- **SQLite** (for simple deployments)

Update the `DATABASE_URL` in your environment variables accordingly.

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub** (already done!)
   
2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Add your environment variables
   - Deploy!

3. **Environment Variables for Production**
   ```env
   DATABASE_URL="your_production_database_url"
   STRIPE_SECRET_KEY="sk_live_your_live_stripe_key"
   STRIPE_WEBHOOK_SECRET="whsec_your_production_webhook_secret"
   NEXT_PUBLIC_BASE_URL="https://your-app.vercel.app"
   ```

## 📁 Project Structure

```
job-invoicer/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard page
│   │   └── settings/       # Settings page
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   └── settings/      # Settings page components
│   └── lib/               # Utilities and types
├── prisma/                # Database schema and migrations
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/mrmoe28/job-invoicer/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## 🎯 Roadmap

- [ ] Multi-currency support
- [ ] Recurring invoices
- [ ] Advanced reporting and analytics
- [ ] Mobile app
- [ ] API documentation
- [ ] Multi-language support

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Stripe](https://stripe.com/) for payment processing
- [Prisma](https://prisma.io/) for the database toolkit
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components

---

**Built with ❤️ by [mrmoe28](https://github.com/mrmoe28)**
