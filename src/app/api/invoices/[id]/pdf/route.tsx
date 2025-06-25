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