import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/lib/pdf-generator';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth token from cookies (optional for development)
    const token = req.cookies.get('auth-token')?.value;
    let userId = null;
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }

    // Get invoice with customer details
    // In development, allow access to all invoices if no auth token
    const invoice = await prisma.invoice.findFirst({
      where: userId ? {
        id: params.id,
        userId: userId
      } : {
        id: params.id
      },
      include: {
        customer: true
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Mock line items for now (in real app, you'd store these in database)
    const mockLineItems = [
      {
        description: 'Professional Services',
        quantity: 1,
        rate: invoice.amount,
        amount: invoice.amount
      }
    ];

    // Prepare invoice data for PDF
    const invoiceData = {
      invoiceId: invoice.invoiceId,
      customerName: invoice.customerName,
      amount: invoice.amount,
      status: invoice.status,
      createdAt: invoice.createdAt.toISOString(),
      customer: invoice.customer ? {
        name: invoice.customer.name,
        email: invoice.customer.email,
        company: invoice.customer.company || undefined,
        address: invoice.customer.address || undefined,
        phone: invoice.customer.phone || undefined,
      } : undefined,
      lineItems: mockLineItems,
      issueDate: invoice.createdAt.toISOString(),
      description: invoice.description || undefined,
      subtotal: invoice.amount,
      taxAmount: 0,
      discountAmount: 0,
      tax: 0,
      discount: 0
    };

    // Default company info (in a real app, this would come from user settings)
    const companyInfo = {
      name: 'Your Company Name',
      address: '123 Business St, City, State 12345',
      phone: '(555) 123-4567',
      email: 'contact@yourcompany.com'
    };

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      <InvoicePDF invoice={invoiceData} companyInfo={companyInfo} />
    );

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceId}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate PDF' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 