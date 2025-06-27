import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Await params
    const { id } = await params;

    // Get invoice with customer details
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        userId: decoded.userId
      },
      include: {
        customer: true
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Generate invoice content

    // For now, return a simple text response until PDF generation is fixed
    const pdfContent = `
INVOICE #${invoice.invoiceId}

Bill To: ${invoice.customerName}
Amount: $${invoice.amount}
Status: ${invoice.status}
Date: ${new Date(invoice.createdAt).toLocaleDateString()}

Description: ${invoice.description || 'Professional Services'}

Total: $${invoice.amount}

Thank you for your business!
EKO SOLAR
    `.trim();

    // Return as plain text for now
    return new NextResponse(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceId}.txt"`,
      },
    });

    // Note: This was replaced with text content above

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate PDF' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 