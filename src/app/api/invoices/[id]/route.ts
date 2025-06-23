import { NextRequest, NextResponse } from 'next/server';
import { mockInvoices, mockCustomers } from '@/lib/mock-data';
import { UpdateInvoiceData } from '@/lib/types';
import { calculateInvoiceTotals } from '@/lib/invoice-utils';

// GET /api/invoices/[id] - Get invoice by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invoice = mockInvoices.find(inv => inv.id === id);
  
  if (!invoice) {
    return NextResponse.json(
      { error: 'Invoice not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(invoice);
}

// PUT /api/invoices/[id] - Update invoice  
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data: UpdateInvoiceData = await request.json();
    const invoiceIndex = mockInvoices.findIndex(inv => inv.id === id);
    
    if (invoiceIndex === -1) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const existingInvoice = mockInvoices[invoiceIndex];
    
    // If customer is being updated, find the new customer
    let customer = existingInvoice.customer;
    if (data.customerId && data.customerId !== existingInvoice.customerId) {
      const foundCustomer = mockCustomers.find(c => c.id === data.customerId);
      if (!foundCustomer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }
      customer = foundCustomer;
    }

    // Update items and recalculate if items changed
    let items = existingInvoice.items;
    let totals = {
      subtotal: existingInvoice.subtotal,
      taxAmount: existingInvoice.taxAmount,
      discountAmount: existingInvoice.discountAmount,
      total: existingInvoice.total
    };

    if (data.items) {
      items = data.items.map((item, index) => ({
        ...item,
        id: `item-${Date.now()}-${index}`
      }));
      totals = calculateInvoiceTotals(items);
    }

    // Update invoice
    const updatedInvoice = {
      ...existingInvoice,
      customerId: data.customerId || existingInvoice.customerId,
      customer,
      status: data.status || existingInvoice.status,
      issueDate: data.issueDate || existingInvoice.issueDate,
      dueDate: data.dueDate || existingInvoice.dueDate,
      items,
      ...totals,
      notes: data.notes !== undefined ? data.notes : existingInvoice.notes,
      terms: data.terms !== undefined ? data.terms : existingInvoice.terms,
      jobLocation: data.jobLocation !== undefined ? data.jobLocation : existingInvoice.jobLocation,
      jobName: data.jobName !== undefined ? data.jobName : existingInvoice.jobName,
      workOrderNumber: data.workOrderNumber !== undefined ? data.workOrderNumber : existingInvoice.workOrderNumber,
      purchaseOrderNumber: data.purchaseOrderNumber !== undefined ? data.purchaseOrderNumber : existingInvoice.purchaseOrderNumber,
      invoiceType: data.invoiceType || existingInvoice.invoiceType,
      adjustment: data.adjustment !== undefined ? data.adjustment : existingInvoice.adjustment,
      adjustmentDescription: data.adjustmentDescription !== undefined ? data.adjustmentDescription : existingInvoice.adjustmentDescription,
      updatedAt: new Date().toISOString()
    };

    mockInvoices[invoiceIndex] = updatedInvoice;

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// PATCH /api/invoices/[id] - Update invoice status only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { status } = await request.json();
    const invoiceIndex = mockInvoices.findIndex(inv => inv.id === id);
    
    if (invoiceIndex === -1) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Update only the status
    mockInvoices[invoiceIndex] = {
      ...mockInvoices[invoiceIndex],
      status,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(mockInvoices[invoiceIndex]);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice status' },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invoiceIndex = mockInvoices.findIndex(inv => inv.id === id);
  
  if (invoiceIndex === -1) {
    return NextResponse.json(
      { error: 'Invoice not found' },
      { status: 404 }
    );
  }

  mockInvoices.splice(invoiceIndex, 1);

  return NextResponse.json({ message: 'Invoice deleted successfully' });
} 