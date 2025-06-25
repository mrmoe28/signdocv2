import { NextRequest, NextResponse } from 'next/server';
import { sendInvoiceEmail } from '@/lib/email-service';
import { mockInvoices } from '@/lib/mock-data';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication is optional for development with mock data
    // In production, implement proper authentication here

    // Get invoice from mock data
    const invoice = mockInvoices.find(inv => inv.id === params.id);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (!invoice.customer?.email) {
      return NextResponse.json({ 
        error: 'Customer email not found' 
      }, { status: 400 });
    }

    // Prepare email data
    const emailData = {
      invoiceId: invoice.invoiceNumber,
      customerName: invoice.customer.name,
      customerEmail: invoice.customer.email,
      amount: invoice.total,
      companyName: 'JOB INVOICER'
    };

    // Send email
    const result = await sendInvoiceEmail(emailData);

    if (result.success) {
      // Update invoice status to 'Sent' if it was 'Draft'
      // Note: In mock data, this would persist only for the current session
      if (invoice.status === 'Draft') {
        invoice.status = 'Sent';
      }

      return NextResponse.json({
        success: true,
        message: 'Invoice email sent successfully',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send email'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ 
      error: 'Failed to send invoice email' 
    }, { status: 500 });
  }
} 