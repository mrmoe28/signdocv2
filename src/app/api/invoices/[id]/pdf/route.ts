import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const prisma = new PrismaClient();

// PDF Styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 50,
    paddingLeft: 50,
    paddingRight: 50,
    paddingBottom: 50,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 5,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'right',
  },
  invoiceNumber: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 5,
  },
  billToSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  billToColumn: {
    flex: 1,
  },
  billToTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  billToText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableColDescription: {
    flex: 3,
  },
  tableColAmount: {
    flex: 1,
    textAlign: 'right',
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCellText: {
    fontSize: 11,
    color: '#6B7280',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 5,
    width: 200,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
  },
  grandTotalValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#059669',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 10,
    color: '#9CA3AF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
});

// PDF Document Component using createElement
const createInvoicePDF = (invoice: {
  invoiceId: string;
  customerName: string;
  amount: number;
  status: string;
  createdAt: Date | string;
  description?: string | null;
  dueDate?: Date | string | null;
  customer?: {
    email?: string | null;
    address?: string | null;
    phone?: string | null;
  } | null;
}) => {
  return React.createElement(Document, null,
    React.createElement(Page, { size: "A4", style: styles.page },
      // Header
      React.createElement(View, { style: styles.header },
        React.createElement(View, null,
          React.createElement(Text, { style: styles.companyName }, "EKO SOLAR"),
          React.createElement(Text, { style: styles.billToText }, "Professional Solar Solutions"),
          React.createElement(Text, { style: styles.billToText }, "123 Solar Street"),
          React.createElement(Text, { style: styles.billToText }, "Atlanta, GA 30309"),
          React.createElement(Text, { style: styles.billToText }, "Phone: +1 (555) 123-4567"),
          React.createElement(Text, { style: styles.billToText }, "Email: info@ekosolar.com")
        ),
        React.createElement(View, null,
          React.createElement(Text, { style: styles.invoiceTitle }, "INVOICE"),
          React.createElement(Text, { style: styles.invoiceNumber }, `#${invoice.invoiceId}`)
        )
      ),

      // Bill To Section
      React.createElement(View, { style: styles.billToSection },
        React.createElement(View, { style: styles.billToColumn },
          React.createElement(Text, { style: styles.billToTitle }, "Bill To:"),
          React.createElement(Text, { style: styles.billToText }, invoice.customerName),
          invoice.customer?.email && React.createElement(Text, { style: styles.billToText }, invoice.customer.email),
          invoice.customer?.address && React.createElement(Text, { style: styles.billToText }, invoice.customer.address),
          invoice.customer?.phone && React.createElement(Text, { style: styles.billToText }, invoice.customer.phone)
        ),
        React.createElement(View, { style: styles.billToColumn },
          React.createElement(Text, { style: styles.billToTitle }, "Invoice Info:"),
          React.createElement(Text, { style: styles.billToText }, `Date: ${new Date(invoice.createdAt).toLocaleDateString()}`),
          React.createElement(Text, { style: styles.billToText }, `Status: ${invoice.status}`),
          invoice.dueDate && React.createElement(Text, { style: styles.billToText }, `Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`)
        )
      ),

      // Items Table
      React.createElement(View, { style: styles.table },
        React.createElement(View, { style: styles.tableHeader },
          React.createElement(View, { style: styles.tableColDescription },
            React.createElement(Text, { style: styles.tableHeaderText }, "Description")
          ),
          React.createElement(View, { style: styles.tableColAmount },
            React.createElement(Text, { style: styles.tableHeaderText }, "Amount")
          )
        ),
        React.createElement(View, { style: styles.tableRow },
          React.createElement(View, { style: styles.tableColDescription },
            React.createElement(Text, { style: styles.tableCellText }, invoice.description || 'Professional Solar Services')
          ),
          React.createElement(View, { style: styles.tableColAmount },
            React.createElement(Text, { style: styles.tableCellText }, `$${invoice.amount}`)
          )
        )
      ),

      // Totals
      React.createElement(View, { style: styles.totalsSection },
        React.createElement(View, { style: styles.totalRow },
          React.createElement(Text, { style: styles.grandTotalLabel }, "Total:"),
          React.createElement(Text, { style: styles.grandTotalValue }, `$${invoice.amount}`)
        )
      ),

      // Footer
      React.createElement(Text, { style: styles.footer },
        "Thank you for your business! For questions about this invoice, please contact us at info@ekosolar.com"
      )
    )
  );
};

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

    // Generate PDF
    const pdfDocument = createInvoicePDF(invoice);
    const pdfBuffer = await renderToBuffer(pdfDocument);

    // Return PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
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
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 