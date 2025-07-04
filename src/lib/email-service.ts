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

interface DocumentEmailData {
  documentId: string;
  documentName: string;
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  recipientName: string;
  message?: string;
  signingUrl?: string;
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
  `.trim();
};

// Generate document email HTML template
const generateDocumentEmailHTML = (data: DocumentEmailData): string => {
  const companyName = data.companyName || 'Sign Docs';
  const actionText = data.signingUrl ? 'Please review and sign the document' : 'Please review the document';
  const buttonText = data.signingUrl ? 'Sign Document' : 'View Document';
  const buttonUrl = data.signingUrl || '#';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document: ${data.documentName}</title>
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
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #3b82f6;
          margin: 0;
        }
        .document-title {
          font-size: 24px;
          color: #374151;
          margin: 20px 0 10px;
        }
        .document-name {
          font-size: 18px;
          color: #6B7280;
          margin: 0;
        }
        .greeting {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .document-details {
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
        }
        .detail-label {
          font-weight: 600;
          color: #374151;
        }
        .detail-value {
          color: #6B7280;
        }
        .message {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .cta-section {
          text-align: center;
          margin: 30px 0;
        }
        .cta-button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          transition: background-color 0.3s;
        }
        .cta-button:hover {
          background-color: #2563eb;
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
          <h2 class="document-title">Document Shared</h2>
          <p class="document-name">${data.documentName}</p>
        </div>
        
        <div class="greeting">
          <p>Dear ${data.recipientName},</p>
          <p>${data.senderName} (${data.senderEmail}) has shared a document with you.</p>
          <p>${actionText}.</p>
        </div>
        
        <div class="document-details">
          <div class="detail-row">
            <span class="detail-label">Document Name:</span>
            <span class="detail-value">${data.documentName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">From:</span>
            <span class="detail-value">${data.senderName} (${data.senderEmail})</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">To:</span>
            <span class="detail-value">${data.recipientName} (${data.recipientEmail})</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Document ID:</span>
            <span class="detail-value">#${data.documentId}</span>
          </div>
        </div>
        
        ${data.message ? `
        <div class="message">
          <p><strong>Message from ${data.senderName}:</strong></p>
          <p>${data.message}</p>
        </div>
        ` : ''}
        
        <div class="cta-section">
          <p>Click the button below to access the document:</p>
          <a href="${buttonUrl}" class="cta-button">${buttonText}</a>
        </div>
        
        <div class="footer">
          <p>This document was sent via ${companyName}.</p>
          <p>If you have any questions, please contact ${data.senderName} at ${data.senderEmail}.</p>
          
          <div class="contact-info">
            <p><strong>${companyName}</strong></p>
            <p>Secure Document Sharing & Signing Platform</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate document email plain text version
const generateDocumentEmailText = (data: DocumentEmailData): string => {
  const companyName = data.companyName || 'Sign Docs';
  const actionText = data.signingUrl ? 'Please review and sign the document' : 'Please review the document';
  const buttonUrl = data.signingUrl || '#';

  return `
${companyName}
Document Shared: ${data.documentName}

Dear ${data.recipientName},

${data.senderName} (${data.senderEmail}) has shared a document with you.
${actionText}.

Document Details:
- Document Name: ${data.documentName}
- From: ${data.senderName} (${data.senderEmail})
- To: ${data.recipientName} (${data.recipientEmail})
- Document ID: #${data.documentId}

${data.message ? `Message from ${data.senderName}:
${data.message}

` : ''}Access the document here: ${buttonUrl}

This document was sent via ${companyName}.
If you have any questions, please contact ${data.senderName} at ${data.senderEmail}.
  `.trim();
};

// Send invoice email
export const sendInvoiceEmail = async (
  invoiceData: InvoiceEmailData,
  pdfBuffer?: Buffer
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      success: false,
      error: 'Email service not configured. Please check SMTP settings.'
    };
  }

  try {
    const htmlContent = generateInvoiceEmailHTML(invoiceData);
    const textContent = generateInvoiceEmailText(invoiceData);

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: invoiceData.customerEmail,
      subject: `Invoice #${invoiceData.invoiceId} from ${invoiceData.companyName || 'JOB INVOICER'}`,
      html: htmlContent,
      text: textContent,
      attachments: pdfBuffer ? [
        {
          filename: `invoice-${invoiceData.invoiceId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ] : []
    };

    const result = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Send document email to sender and recipient
export const sendDocumentEmail = async (
  documentData: DocumentEmailData,
  pdfBuffer?: Buffer
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      success: false,
      error: 'Email service not configured. Please check SMTP settings.'
    };
  }

  try {
    const htmlContent = generateDocumentEmailHTML(documentData);
    const textContent = generateDocumentEmailText(documentData);

    const subject = documentData.signingUrl
      ? `Document for Signing: ${documentData.documentName}`
      : `Document Shared: ${documentData.documentName}`;

    // Email to recipient
    const recipientMailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: documentData.recipientEmail,
      subject: subject,
      html: htmlContent,
      text: textContent,
      attachments: pdfBuffer ? [
        {
          filename: `${documentData.documentName}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ] : []
    };

    // Email to sender (confirmation)
    const senderMailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: documentData.senderEmail,
      subject: `Document Sent: ${documentData.documentName}`,
      html: htmlContent.replace('has shared a document with you', 'You have successfully shared a document')
        .replace(`Dear ${documentData.recipientName}`, `Dear ${documentData.senderName}`)
        .replace('Click the button below to access the document:', 'Document successfully sent to recipient.'),
      text: textContent.replace('has shared a document with you', 'You have successfully shared a document')
        .replace(`Dear ${documentData.recipientName}`, `Dear ${documentData.senderName}`)
        .replace('Access the document here:', 'Document successfully sent to recipient.'),
      attachments: pdfBuffer ? [
        {
          filename: `${documentData.documentName}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ] : []
    };

    // Send to recipient
    const recipientResult = await transporter.sendMail(recipientMailOptions);

    // Send to sender
    const senderResult = await transporter.sendMail(senderMailOptions);

    return {
      success: true,
      messageId: `${recipientResult.messageId}, ${senderResult.messageId}`
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
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