import { NextRequest, NextResponse } from 'next/server';
import { drizzleDb as db } from '@/lib/db';
import { documents, signers, signatureFields } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import nodemailer from 'nodemailer';

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: 'signer' | 'approver' | 'cc';
  order: number;
}

interface SignatureField {
  id: string;
  type: 'signature' | 'initial' | 'date' | 'text';
  recipientId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required: boolean;
  label: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { recipients, signatureFields: fields, emailSubject, emailMessage } = await request.json();
    const { id: documentId } = await params;

    // Fetch the document
    const document = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
    if (!document.length) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const doc = document[0];

    // Create signers in the database
    const signerData = [];

    for (const recipient of recipients as Recipient[]) {
      const emailToken = nanoid();

      signerData.push({
        id: nanoid(),
        documentId,
        name: recipient.name,
        email: recipient.email,
        emailToken,
        status: 'pending',
        order: recipient.order,
        signedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Insert signers
    await db.insert(signers).values(signerData);

    // Create signature fields in the database
    const fieldData = [];

    for (const field of fields as SignatureField[]) {
      const signer = signerData.find(s => s.email === recipients.find((r: Recipient) => r.id === field.recipientId)?.email);
      if (signer) {
        fieldData.push({
          id: nanoid(),
          documentId,
          signerId: signer.id,
          fieldType: field.type,
          page: field.page,
          x: field.x,
          y: field.y,
          width: field.width,
          height: field.height,
          required: field.required ? 'true' : 'false',
          value: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Insert signature fields
    if (fieldData.length > 0) {
      await db.insert(signatureFields).values(fieldData);
    }

    // Update document status
    await db.update(documents)
      .set({
        status: 'sent',
        sentAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(documents.id, documentId));

    // Send emails to recipients in order
    const sortedRecipients = (recipients as Recipient[]).sort((a, b) => a.order - b.order);

    // Send to first recipient(s) in the sequence
    const firstOrderRecipients = sortedRecipients.filter(r => r.order === sortedRecipients[0].order);

    for (const recipient of firstOrderRecipients) {
      const signer = signerData.find(s => s.email === recipient.email);
      if (signer) {
        await sendSignatureRequestEmail(
          recipient,
          doc,
          signer.emailToken,
          emailSubject,
          emailMessage
        );
      }
    }

    return NextResponse.json({
      message: 'Envelope sent successfully',
      envelopeId: documentId,
      recipientCount: recipients.length
    });

  } catch (error) {
    console.error('Error sending envelope:', error);
    return NextResponse.json(
      { error: 'Failed to send envelope' },
      { status: 500 }
    );
  }
}

async function sendSignatureRequestEmail(
  recipient: Recipient,
  document: typeof documents.$inferSelect,
  emailToken: string,
  subject: string,
  message: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const signUrl = `${baseUrl}/sign/${emailToken}`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-bottom: 16px;">
          ${recipient.role === 'signer' ? '📝 Signature Required' :
      recipient.role === 'approver' ? '✅ Approval Required' :
        '📋 Document Shared'}
        </h2>
        <p style="color: #6b7280; margin-bottom: 0;">
          You have been invited to ${recipient.role === 'signer' ? 'sign' :
      recipient.role === 'approver' ? 'approve' :
        'review'} a document.
        </p>
      </div>
      
      <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 16px;">Document Details</h3>
        <div style="background: #f9fafb; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
          <p style="margin: 0; font-weight: 600; color: #374151;">📄 ${document.name}</p>
        </div>
        
        ${message ? `
          <div style="background: #eff6ff; padding: 16px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-bottom: 16px;">
            <p style="margin: 0; color: #1e40af; font-weight: 500;">Message from sender:</p>
            <p style="margin: 8px 0 0 0; color: #374151;">${message}</p>
          </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 24px;">
          <a href="${signUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            ${recipient.role === 'signer' ? 'Sign Document' :
      recipient.role === 'approver' ? 'Approve Document' :
        'View Document'}
          </a>
        </div>
      </div>
      
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; font-size: 14px; color: #6b7280;">
        <p style="margin: 0; margin-bottom: 8px;"><strong>What happens next?</strong></p>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Click the button above to open the document</li>
          <li>Follow the guided steps to complete your part</li>
          <li>You'll receive a copy of the completed document when finished</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #9ca3af;">
        <p>This is an automated message. Please do not reply directly to this email.</p>
        <p>If you have questions about this document, please contact the sender directly.</p>
      </div>
    </div>
  `;

  const emailText = `
    ${recipient.role === 'signer' ? 'Signature Required' :
      recipient.role === 'approver' ? 'Approval Required' :
        'Document Shared'}
    
    You have been invited to ${recipient.role === 'signer' ? 'sign' :
      recipient.role === 'approver' ? 'approve' :
        'review'} the following document:
    
    Document: ${document.name}
    
    ${message ? `Message from sender: ${message}` : ''}
    
    To get started, click the link below:
    ${signUrl}
    
    What happens next?
    1. Click the link above to open the document
    2. Follow the guided steps to complete your part
    3. You'll receive a copy of the completed document when finished
    
    This is an automated message. Please do not reply directly to this email.
  `;

  // Send the email
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: recipient.email,
        subject,
        html: emailHtml,
        text: emailText
      });
      console.log(`✅ Email sent to ${recipient.email}`);
    } else {
      console.log('📧 Email would be sent to:', recipient.email);
      console.log('Subject:', subject);
      console.log('Content:', emailText.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
} 