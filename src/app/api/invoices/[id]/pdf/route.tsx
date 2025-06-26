import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/lib/pdf-generator';
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    const { id } = await params;

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

    // Create a simple line item from the invoice description
    const lineItems = [{
      description: invoice.description || 'Solar installation and services',
      quantity: 1,
      rate: invoice.amount,
      amount: invoice.amount
    }];

    // Prepare invoice data for PDF
    const invoiceData = {
      invoiceId: invoice.invoiceId,
      customerName: invoice.customer?.name || invoice.customerName,
      amount: invoice.amount,
      status: invoice.status,
      createdAt: invoice.createdAt.toISOString(),
      customer: {
        name: invoice.customer?.name || invoice.customerName,
        email: invoice.customer?.email || '',
        company: invoice.customer?.company || undefined,
        address: invoice.customer?.address || undefined,
        phone: invoice.customer?.phone || undefined,
      },
      lineItems: lineItems,
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
      name: 'EKO SOLAR.LLC',
      address: '123 Solar Street\nAtlanta, GA 30309',
      phone: '(404) 551-6532',
      email: 'ekosolarize@gmail.com',
      logo: 'data:image/svg+xml;base64,' + Buffer.from(`<svg width="120" height="60" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <circle cx="30" cy="30" r="25" fill="#059669" opacity="0.1"/>
  <g stroke="#059669" stroke-width="2" fill="none">
    <line x1="30" y1="8" x2="30" y2="15"/>
    <line x1="30" y1="45" x2="30" y2="52"/>
    <line x1="8" y1="30" x2="15" y2="30"/>
    <line x1="45" y1="30" x2="52" y2="30"/>
    <line x1="13.8" y1="13.8" x2="18.6" y2="18.6"/>
    <line x1="41.4" y1="41.4" x2="46.2" y2="46.2"/>
    <line x1="46.2" y1="13.8" x2="41.4" y2="18.6"/>
    <line x1="18.6" y1="41.4" x2="13.8" y2="46.2"/>
  </g>
  <circle cx="30" cy="30" r="8" fill="#059669"/>
  <text x="65" y="25" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#374151">EKO SOLAR</text>
  <text x="65" y="40" font-family="Arial, sans-serif" font-size="10" fill="#6B7280">Clean Energy Solutions</text>
</svg>`).toString('base64') // In production, this would come from user profile settings
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
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 