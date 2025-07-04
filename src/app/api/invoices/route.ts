import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/stack-auth-helpers';
import { drizzleDb as db } from '@/lib/db';
import { invoices, customers } from '@/lib/schema';
import { nanoid } from 'nanoid';
import { eq, desc, and, or, ilike } from 'drizzle-orm';

// GET /api/invoices - Get all invoices with filtering
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Stack Auth
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build where clause
    const whereConditions = [eq(invoices.userId, user.id)];

    if (status && status !== 'All') {
      whereConditions.push(eq(invoices.status, status));
    }

    if (search) {
      const searchCondition = or(
        ilike(invoices.number, `%${search}%`),
        ilike(invoices.description, `%${search}%`)
      );
      if (searchCondition) {
        whereConditions.push(searchCondition);
      }
    }

    const whereClause = whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];

    const invoicesList = await db
      .select({
        id: invoices.id,
        number: invoices.number,
        customerId: invoices.customerId,
        userId: invoices.userId,
        amount: invoices.amount,
        tax: invoices.tax,
        total: invoices.total,
        status: invoices.status,
        dueDate: invoices.dueDate,
        paidDate: invoices.paidDate,
        description: invoices.description,
        items: invoices.items,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
        customer: {
          id: customers.id,
          name: customers.name,
          email: customers.email,
          phone: customers.phone,
          company: customers.company
        }
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(whereClause)
      .orderBy(desc(invoices.createdAt));

    return NextResponse.json({
      invoices: invoicesList,
      total: invoicesList.length
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create new invoice
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Stack Auth
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Extract data from request
    const {
      customerId,
      invoiceNumber,
      description,
      amount,
      tax = 0,
      total,
      status = 'draft',
      dueDate,
      items
    } = data;

    // Validation
    if (!customerId || !invoiceNumber) {
      return NextResponse.json(
        { error: 'Customer ID and invoice number are required' },
        { status: 400 }
      );
    }

    // Verify customer exists and belongs to user
    const customer = await db
      .select()
      .from(customers)
      .where(and(
        eq(customers.id, customerId),
        eq(customers.userId, user.id)
      ))
      .limit(1);

    if (customer.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      );
    }

    // Create new invoice
    const newInvoice = {
      id: nanoid(),
      number: invoiceNumber,
      customerId,
      userId: user.id,
      amount: amount || 0,
      tax,
      total: total || amount || 0,
      status,
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      description: description || '',
      items: items || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [invoice] = await db
      .insert(invoices)
      .values(newInvoice)
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Invoice created successfully',
      invoice
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating invoice:', error);

    if (error instanceof Error) {
      if (error.message.includes('unique constraint')) {
        return NextResponse.json(
          { error: 'An invoice with this number already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
} 