import { NextRequest, NextResponse } from 'next/server';
import { sendInvoiceEmail } from '@/lib/email-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  try {
    // For now, we'll use the admin user as fallback
    // In a real app, you'd get this from the session/token
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@ekosolar.com' }
    });
    
    if (!adminUser) {
      throw new Error('Admin user not found');
    }
    
    return adminUser;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    throw error;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;
    const { recipientEmail, subject, message } = await req.json();

    // Get invoice from database
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        userId: user.id
      },
      include: {
        customer: true
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const customerEmail = recipientEmail || invoice.customer?.email;
    if (!customerEmail) {
      return NextResponse.json({ 
        error: 'Customer email not found' 
      }, { status: 400 });
    }

    // Prepare email data
    const emailData = {
      invoiceId: invoice.invoiceId,
      customerName: invoice.customer?.name || invoice.customerName,
      customerEmail: customerEmail,
      amount: invoice.amount,
      companyName: 'EKO SOLAR',
      subject: subject || `Invoice ${invoice.invoiceId} from EKO SOLAR`,
      message: message || `Dear ${invoice.customer?.name || invoice.customerName},\n\nPlease find attached your invoice ${invoice.invoiceId} for $${invoice.amount}.\n\nThank you for your business!\n\nBest regards,\nEKO SOLAR Team`
    };

    // Send email
    const result = await sendInvoiceEmail(emailData);

    if (result.success) {
      // Update invoice status to 'Sent' if it was 'Draft'
      if (invoice.status === 'Draft') {
        await prisma.invoice.update({
          where: { id: invoice.id },
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