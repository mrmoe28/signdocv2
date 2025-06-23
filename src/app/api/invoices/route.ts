import { NextRequest, NextResponse } from 'next/server';
import { mockInvoices, mockCustomers } from '@/lib/mock-data';
import { Invoice, CreateInvoiceData, InvoiceFilters } from '@/lib/types';
import { generateInvoiceNumber, calculateInvoiceTotals } from '@/lib/invoice-utils';

// GET /api/invoices - Get all invoices with filtering
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as InvoiceFilters['status'];
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') as InvoiceFilters['sortBy'] || 'invoiceNumber';
  const sortOrder = searchParams.get('sortOrder') as InvoiceFilters['sortOrder'] || 'desc';

  let filteredInvoices = [...mockInvoices];

  // Filter by status
  if (status && status !== 'All') {
    filteredInvoices = filteredInvoices.filter(invoice => invoice.status === status);
  }

  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase();
    filteredInvoices = filteredInvoices.filter(invoice =>
      invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
      invoice.customer.name.toLowerCase().includes(searchLower) ||
      invoice.customer.company?.toLowerCase().includes(searchLower)
    );
  }

  // Sort invoices
  filteredInvoices.sort((a, b) => {
    let aValue: string | number | Date;
    let bValue: string | number | Date;

    switch (sortBy) {
      case 'customer':
        aValue = a.customer.name;
        bValue = b.customer.name;
        break;
      case 'total':
        aValue = a.total;
        bValue = b.total;
        break;
      case 'dueDate':
        aValue = new Date(a.dueDate);
        bValue = new Date(b.dueDate);
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = a.invoiceNumber;
        bValue = b.invoiceNumber;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return NextResponse.json({
    invoices: filteredInvoices,
    total: filteredInvoices.length
  });
}

// POST /api/invoices - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const data: CreateInvoiceData = await request.json();

    // Find customer
    const customer = mockCustomers.find(c => c.id === data.customerId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Add IDs to items
    const itemsWithIds = data.items.map((item, index) => ({
      ...item,
      id: `item-${Date.now()}-${index}`
    }));

    // Calculate totals
    const totals = calculateInvoiceTotals(itemsWithIds);

    // Create new invoice
    const newInvoice: Invoice = {
      id: `invoice-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      customerId: data.customerId,
      customer,
      status: 'Draft',
      issueDate: data.issueDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate,
      items: itemsWithIds,
      ...totals,
      notes: data.notes,
      terms: data.terms || 'Payment due within 30 days',
      jobLocation: data.jobLocation,
      jobName: data.jobName,
      workOrderNumber: data.workOrderNumber,
      purchaseOrderNumber: data.purchaseOrderNumber,
      invoiceType: data.invoiceType || 'Total Due',
      adjustment: data.adjustment || 0,
      adjustmentDescription: data.adjustmentDescription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real app, save to database
    mockInvoices.push(newInvoice);

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
} 