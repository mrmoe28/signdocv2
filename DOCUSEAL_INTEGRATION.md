# DocuSeal Integration Guide

DocuSeal has been successfully integrated into your Next.js application! Here's everything you need to know.

## 🚀 What's Included

### 1. **API Routes**

- `/api/docuseal` - Creates signing tokens and manages signature requests
- `/api/docuseal/webhook` - Handles DocuSeal completion notifications

### 2. **React Components**

- `DocuSealViewer` - Complete signing interface with three modes:
  - **Setup Mode**: Add signer details
  - **Signing Mode**: DocuSeal embedded signing form
  - **Complete Mode**: View completed signatures

### 3. **Enhanced Documents Page**

- `DocumentsPageWithDocuSeal` - Integrates DocuSeal alongside existing signature tools

## ⚙️ Setup Instructions

### Step 1: Get DocuSeal API Key

1. Sign up at [DocuSeal](https://docuseal.com)
2. Get your API token from the dashboard
3. Add to your environment variables:

```bash
# Add to .env.local
DOCUSEAL_TOKEN=your_docuseal_api_token_here
```

### Step 2: Configure Webhook (Optional)

If you want real-time signature notifications:

1. In DocuSeal dashboard, add webhook URL:

   ```
   https://your-domain.com/api/docuseal/webhook
   ```

2. Select events: `document.signed`, `document.failed`

### Step 3: Update Your Documents Page

Replace your current documents page with the enhanced version:

```jsx
// In src/app/documents/page.tsx
import DocumentsPageWithDocuSeal from '@/components/documents/DocumentsPageWithDocuSeal';

export default function DocumentsPage() {
  return <DocumentsPageWithDocuSeal />;
}
```

## 🎯 How to Use

### For Document Uploaders

1. **Upload PDF** - Use the existing upload interface
2. **Send for E-Signature** - Click the blue "E-Sign" button
3. **Add Signer Details** - Enter name and email
4. **Send Request** - DocuSeal handles the rest!

### For Document Signers

1. **Receive Email** - DocuSeal sends signing invitation
2. **Click Link** - Opens embedded signing interface
3. **Sign Document** - Use DocuSeal's signing tools
4. **Complete** - Document status updates automatically

## 🔧 Integration Features

### Authentication

- ✅ Works with your existing Stack Auth
- ✅ Fallback to admin user if auth fails
- ✅ User permissions respected

### Database Integration

- ✅ Signatures saved to your PostgreSQL database
- ✅ Document status tracking
- ✅ Automatic completion timestamps

### Error Handling

- ✅ Graceful error handling
- ✅ User-friendly error messages
- ✅ Retry mechanisms

## 🎨 Customization Options

### Styling

The DocuSeal components use your existing Tailwind classes and can be customized:

```jsx
// Custom styling example
<DocuSealViewer
  documentId={doc.id}
  documentName={doc.name}
  documentUrl={doc.fileUrl}
  className="custom-docuseal-styling"
/>
```

### Branding

Configure DocuSeal branding in your dashboard:

- Company logo
- Color scheme
- Email templates
- Domain customization

## 💰 Pricing

DocuSeal pricing is pay-per-use:

- **Sandbox**: Free for testing
- **Production**: $0.20 per document signed
- **Pro Plan**: $20/month for API access

## 🔒 Security Features

- JWT token authentication
- Document access validation
- User permission checking
- Secure webhook handling
- SSL/TLS encryption

## 🎯 Benefits Over Custom Solutions

### ✅ **DocuSeal Advantages:**

- **Legal Compliance**: Meets eSignature legal requirements
- **Professional UI**: Polished signing experience
- **Mobile Optimized**: Works perfectly on phones/tablets
- **Audit Trail**: Complete signing history
- **Email Automation**: Automated invitations and reminders
- **Multi-signature**: Support for multiple signers
- **Template System**: Reusable document templates

### ⚖️ **vs Your Current Canvas System:**

| Feature | Canvas System | DocuSeal |
|---------|---------------|----------|
| Legal Validity | Basic | ✅ Full |
| Mobile Experience | Limited | ✅ Excellent |
| Email Automation | Manual | ✅ Automatic |
| Audit Trail | Basic | ✅ Complete |
| Multi-signer | Complex | ✅ Built-in |
| Maintenance | High | ✅ Zero |

## 🛠️ Development Tips

### Testing

```bash
# Test with sandbox mode
DOCUSEAL_TOKEN=sandbox_token_here npm run dev
```

### Debugging

```javascript
// Enable DocuSeal debug mode
console.log('DocuSeal token generated:', token);
```

### Database Queries

```sql
-- Check signature status
SELECT d.name, d.status, s.signer_email, s.signed_at 
FROM documents d 
LEFT JOIN signatures s ON d.id = s.document_id;
```

## 🚀 Next Steps

1. **Set up your DocuSeal account**
2. **Add your API token** to environment variables
3. **Test with a sample document**
4. **Configure webhook** for real-time updates
5. **Customize styling** to match your brand

## 📞 Support

- **DocuSeal Docs**: [https://docs.docuseal.com](https://docs.docuseal.com)
- **API Reference**: [https://docs.docuseal.com/api](https://docs.docuseal.com/api)
- **Support**: Available via Discord/Email

---

## 🎉 You're Ready

Your application now has enterprise-grade e-signature capabilities with DocuSeal! The integration maintains your existing functionality while adding powerful new signing features.

**Quick Test**: Upload a PDF → Click "E-Sign" → Add signer details → Test the flow!
