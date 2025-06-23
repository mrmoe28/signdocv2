import { NextResponse } from 'next/server';
import { mockCustomers } from '@/lib/mock-data';

// GET /api/customers/[id] - Get a specific customer
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customer = mockCustomers.find(c => c.id === params.id);
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT /api/customers/[id] - Update a specific customer
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, email, phone, address, company, contactPerson } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const customerIndex = mockCustomers.findIndex(c => c.id === params.id);
    
    if (customerIndex === -1) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Update the customer
    mockCustomers[customerIndex] = {
      ...mockCustomers[customerIndex],
      name,
      email,
      phone: phone || undefined,
      address: address || undefined,
      company: company || undefined,
      contactPerson: contactPerson || undefined,
    };

    return NextResponse.json(mockCustomers[customerIndex]);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete a specific customer
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customerIndex = mockCustomers.findIndex(c => c.id === params.id);
    
    if (customerIndex === -1) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Remove the customer
    const deletedCustomer = mockCustomers.splice(customerIndex, 1)[0];

    return NextResponse.json({
      message: 'Customer deleted successfully',
      customer: deletedCustomer
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
} 