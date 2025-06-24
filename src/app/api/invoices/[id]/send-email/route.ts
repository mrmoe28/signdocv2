import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { sendInvoiceEmail } from '@/lib/email-service';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth token from cookies
    const token = req.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get invoice with customer details
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: decoded.userId
      },
      include: {
        customer: true
      }
    });

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
      invoiceId: invoice.invoiceId,
      customerName: invoice.customerName,
      customerEmail: invoice.customer.email,
      amount: invoice.amount,
      companyName: 'JOB INVOICER'
    };

    // Send email
    const result = await sendInvoiceEmail(emailData);

    if (result.success) {
      // Update invoice status to 'Sent' if it was 'Draft'
      if (invoice.status === 'Draft') {
        await prisma.invoice.update({
          where: { id: params.id },
          data: { status: 'Sent' }
        });
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
  } finally {
    await prisma.$disconnect();
  }
} 