import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface InvoiceEmailData {
  invoiceId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  dueDate?: string;
  companyName?: string;
}

// Email configuration - in production, use environment variables
const getEmailConfig = (): EmailConfig => {
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  };
};

// Create transporter
const createTransporter = () => {
  const config = getEmailConfig();
  
  // For development, use Ethereal Email (test account)
  if (!config.auth.user || !config.auth.pass) {
    console.warn('Email credentials not configured. Using test mode.');
    return null;
  }
  
  return nodemailer.createTransport(config);
};

// Generate invoice email HTML template
const generateInvoiceEmailHTML = (data: InvoiceEmailData): string => {
  const companyName = data.companyName || 'JOB INVOICER';
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(data.amount);

  const dueDateText = data.dueDate 
    ? `Due Date: ${new Date(data.dueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`
    : 'Payment terms as agreed';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${data.invoiceId}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .email-container {
          background-color: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #059669;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #059669;
          margin: 0;
        }
        .invoice-title {
          font-size: 24px;
          color: #374151;
          margin: 20px 0 10px;
        }
        .invoice-number {
          font-size: 18px;
          color: #6B7280;
          margin: 0;
        }
        .greeting {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .invoice-details {
          background-color: #f9fafb;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
          font-weight: bold;
          font-size: 18px;
          color: #059669;
        }
        .detail-label {
          font-weight: 600;
          color: #374151;
        }
        .detail-value {
          color: #6B7280;
        }
        .cta-section {
          text-align: center;
          margin: 30px 0;
        }
        .cta-button {
          display: inline-block;
          background-color: #059669;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          transition: background-color 0.3s;
        }
        .cta-button:hover {
          background-color: #047857;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6B7280;
          font-size: 14px;
        }
        .contact-info {
          margin-top: 20px;
          font-size: 14px;
          color: #6B7280;
        }
        @media (max-width: 600px) {
          body {
            padding: 10px;
          }
          .email-container {
            padding: 20px;
          }
          .detail-row {
            flex-direction: column;
            gap: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1 class="company-name">${companyName}</h1>
          <h2 class="invoice-title">New Invoice</h2>
          <p class="invoice-number">#${data.invoiceId}</p>
        </div>
        
        <div class="greeting">
          <p>Dear ${data.customerName},</p>
          <p>We hope this email finds you well. Please find attached your invoice for recent services provided.</p>
        </div>
        
        <div class="invoice-details">
          <div class="detail-row">
            <span class="detail-label">Invoice Number:</span>
            <span class="detail-value">#${data.invoiceId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Customer:</span>
            <span class="detail-value">${data.customerName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">${dueDateText.includes('Due Date') ? 'Due Date:' : 'Payment Terms:'}</span>
            <span class="detail-value">${dueDateText.replace('Due Date: ', '')}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Total Amount:</span>
            <span class="detail-value">${formattedAmount}</span>
          </div>
        </div>
        
        <div class="cta-section">
          <p>You can view and download your invoice using the link below:</p>
          <a href="#" class="cta-button">View Invoice</a>
        </div>
        
        <div class="footer">
          <p>Thank you for your business! We appreciate your prompt payment.</p>
          <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
          
          <div class="contact-info">
            <p><strong>${companyName}</strong></p>
            <p>Email: info@jobinvoicer.com | Phone: (555) 123-4567</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate plain text version
const generateInvoiceEmailText = (data: InvoiceEmailData): string => {
  const companyName = data.companyName || 'JOB INVOICER';
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(data.amount);

  const dueDateText = data.dueDate 
    ? `Due Date: ${new Date(data.dueDate).toLocaleDateString()}`
    : 'Payment terms as agreed';

  return `
${companyName}
New Invoice #${data.invoiceId}

Dear ${data.customerName},

We hope this email finds you well. Please find attached your invoice for recent services provided.

Invoice Details:
- Invoice Number: #${data.invoiceId}
- Customer: ${data.customerName}
- ${dueDateText}
- Total Amount: ${formattedAmount}

Thank you for your business! We appreciate your prompt payment.

If you have any questions about this invoice, please don't hesitate to contact us.

Best regards,
${companyName}
Email: info@jobinvoicer.com | Phone: (555) 123-4567
  `;
};

// Send invoice email
export const sendInvoiceEmail = async (
  invoiceData: InvoiceEmailData,
  pdfBuffer?: Buffer
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      // For development: simulate successful email sending
      console.log('📧 DEVELOPMENT MODE: Simulating email send');
      console.log(`To: ${invoiceData.customerEmail}`);
      console.log(`Subject: Invoice #${invoiceData.invoiceId} from ${invoiceData.companyName || 'JOB INVOICER'}`);
      console.log(`Customer: ${invoiceData.customerName}`);
      console.log(`Amount: $${invoiceData.amount}`);
      console.log('✅ Email would be sent successfully in production');
      
      return {
        success: true,
        messageId: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
    }

    const mailOptions = {
      from: `"${invoiceData.companyName || 'JOB INVOICER'}" <${process.env.SMTP_USER}>`,
      to: invoiceData.customerEmail,
      subject: `Invoice #${invoiceData.invoiceId} from ${invoiceData.companyName || 'JOB INVOICER'}`,
      text: generateInvoiceEmailText(invoiceData),
      html: generateInvoiceEmailHTML(invoiceData),
      attachments: pdfBuffer ? [{
        filename: `invoice-${invoiceData.invoiceId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }] : []
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error'
    };
  }
};

// Test email configuration
export const testEmailConfig = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return {
        success: false,
        error: 'Email service not configured'
      };
    }

    await transporter.verify();
    
    return { success: true };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email configuration test failed'
    };
  }
}; 