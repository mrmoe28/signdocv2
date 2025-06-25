import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/lib/pdf-generator';
import { mockInvoices } from '@/lib/mock-data';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication is optional for development with mock data
    // In production, implement proper authentication here

    // Await params in Next.js 15
    const { id } = await params;

    // Get invoice from mock data
    const invoice = mockInvoices.find(inv => inv.id === id);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Convert invoice items to line items for PDF
    const lineItems = invoice.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.quantity * item.rate
    }));

    // Prepare invoice data for PDF
    const invoiceData = {
      invoiceId: invoice.invoiceNumber,
      customerName: invoice.customer.name,
      amount: invoice.total,
      status: invoice.status,
      createdAt: invoice.issueDate,
      customer: {
        name: invoice.customer.name,
        email: invoice.customer.email,
        company: invoice.customer.company || undefined,
        address: invoice.customer.address || undefined,
        phone: invoice.customer.phone || undefined,
      },
      lineItems: lineItems,
      issueDate: invoice.issueDate,
      description: invoice.notes || undefined,
      subtotal: invoice.subtotal,
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
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
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
  }
} 