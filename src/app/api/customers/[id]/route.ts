import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Helper function to get authenticated user or default admin
async function getAuthenticatedUser(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value;
  
  let userId = null;
  
  // Try to get user from token first
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      // Verify the user actually exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      if (user) {
        userId = user.id;
      }
    }
  }
  
  // If no valid token/user, use the default admin user
  if (!userId) {
    const defaultUser = await prisma.user.findFirst({
      where: { email: 'admin@ekosolar.com' }
    });
    
    if (!defaultUser) {
      throw new Error('No default admin user found. Please set up the admin user first.');
    }
    
    userId = defaultUser.id;
  }
  
  return userId;
}

// GET /api/customers/[id] - Get a specific customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUser(request);
    
    const customer = await prisma.customer.findFirst({
      where: {
        id: id,
        userId: userId
      }
    });
    
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
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/customers/[id] - Update a specific customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUser(request);
    const body = await request.json();
    
    const {
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

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Please provide a valid email address' 
      }, { status: 400 });
    }

    // Check if customer exists and belongs to the user
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: id,
        userId: userId
      }
    });
    
    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it conflicts with another customer
    if (email.toLowerCase() !== existingCustomer.email.toLowerCase()) {
      const emailConflict = await prisma.customer.findFirst({
        where: {
          email: email.toLowerCase(),
          userId: userId,
          NOT: { id: id }
        }
      });

      if (emailConflict) {
        return NextResponse.json(
          { error: 'A customer with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Update the customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: id },
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        company: company ? company.trim() : null,
        address: address ? address.trim() : null,
        contactPerson: contactPerson ? contactPerson.trim() : null,
        customerType: customerType || 'residential',
        notifyByEmail: notifyByEmail !== false,
        notifyBySmsText: notifyBySmsText !== false,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/customers/[id] - Delete a specific customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUser(request);
    
    // Check if customer exists and belongs to the user
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: id,
        userId: userId
      }
    });
    
    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Delete the customer
    const deletedCustomer = await prisma.customer.delete({
      where: { id: id }
    });

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
      customer: deletedCustomer
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 