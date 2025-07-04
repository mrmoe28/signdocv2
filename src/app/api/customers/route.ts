import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/stack-auth-helpers';
import { drizzleDb as db } from '@/lib/db';
import { customers } from '@/lib/schema';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

// GET /api/customers - Get all customers
export async function GET() {
  try {
    // Get authenticated user from Stack Auth
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch customers for the authenticated user
    const customersList = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.id));

    return NextResponse.json(customersList);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Stack Auth
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      address,
      contactPerson,
      customerType = 'residential',
      notifyByEmail = true,
      notifyBySmsText = true
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Create new customer
    const newCustomer = {
      id: nanoid(),
      name,
      email,
      phone: phone || null,
      company: company || null,
      address: address || null,
      contactPerson: contactPerson || null,
      customerType,
      notifyByEmail,
      notifyBySmsText,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [customer] = await db
      .insert(customers)
      .values(newCustomer)
      .returning();

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user from Stack Auth
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      email,
      phone,
      company,
      address,
      contactPerson,
      customerType,
      notifyByEmail,
      notifyBySmsText
    } = body;

    if (!id || !name || !email) {
      return NextResponse.json({ error: 'ID, name and email are required' }, { status: 400 });
    }

    // Update customer (only if it belongs to the authenticated user)
    const [updatedCustomer] = await db
      .update(customers)
      .set({
        name,
        email,
        phone: phone || null,
        company: company || null,
        address: address || null,
        contactPerson: contactPerson || null,
        customerType: customerType || 'residential',
        notifyByEmail: notifyByEmail !== undefined ? notifyByEmail : true,
        notifyBySmsText: notifyBySmsText !== undefined ? notifyBySmsText : true,
        updatedAt: new Date()
      })
      .where(eq(customers.id, id))
      .returning();

    if (!updatedCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 