import { NextResponse } from 'next/server';
import { mockCustomers } from '@/lib/mock-data';

// GET /api/customers - Get all customers
export async function GET() {
  return NextResponse.json({
    customers: mockCustomers,
    total: mockCustomers.length
  });
}

// POST /api/customers - Create a new customer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, company, contactPerson } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Generate a new customer ID
    const newId = (mockCustomers.length + 1).toString();
    
    const newCustomer = {
      id: newId,
      name,
      email,
      phone: phone || undefined,
      address: address || undefined,
      company: company || undefined,
      contactPerson: contactPerson || undefined,
    };

    // Add to mock data (in a real app, this would save to database)
    mockCustomers.push(newCustomer);

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
} 